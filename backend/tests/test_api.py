"""API tests covering the cases listed in the project spec (section 13)."""
import os
import sys

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app  # noqa: E402
from config import TestConfig  # noqa: E402


@pytest.fixture()
def client():
    app = create_app(TestConfig)
    with app.test_client() as c:
        yield c


def add(client, name="Rahul", activity="Football", hours=3):
    return client.post("/activities", json={"name": name, "activity": activity, "hours": hours})


def test_add_valid_activity(client):
    res = add(client)
    assert res.status_code == 201
    data = res.get_json()["data"]
    assert data["id"] == 1 and data["name"] == "Rahul" and data["hours"] == 3.0
    assert data["created_at"]


def test_numeric_string_hours_accepted(client):
    assert add(client, hours="2.5").status_code == 201


@pytest.mark.parametrize(
    "payload, field",
    [
        ({"name": "", "activity": "Chess", "hours": 1}, "name"),
        ({"name": "   ", "activity": "Chess", "hours": 1}, "name"),
        ({"name": "Asha", "activity": "", "hours": 1}, "activity"),
        ({"name": "Asha", "activity": "Chess"}, "hours"),
        ({"name": "Asha", "activity": "Chess", "hours": ""}, "hours"),
    ],
)
def test_empty_fields_rejected(client, payload, field):
    res = client.post("/activities", json=payload)
    assert res.status_code == 400
    assert field in res.get_json()["error"]["details"]


@pytest.mark.parametrize("hours", [0, -2, "abc", "NaN", "inf", True, [1]])
def test_invalid_hours_rejected(client, hours):
    res = add(client, hours=hours)
    assert res.status_code == 400
    assert "hours" in res.get_json()["error"]["details"]


def test_non_json_body_rejected(client):
    res = client.post("/activities", data="not json", content_type="text/plain")
    assert res.status_code == 400
    assert "error" in res.get_json()


def test_list_activities(client):
    add(client)
    add(client, name="Priya", activity="Music", hours=2)
    res = client.get("/activities")
    assert res.status_code == 200
    body = res.get_json()
    assert body["count"] == 2
    assert {a["name"] for a in body["data"]} == {"Rahul", "Priya"}


def test_summary_empty(client):
    res = client.get("/summary")
    assert res.status_code == 200
    assert res.get_json() == {
        "total_entries": 0,
        "total_students": 0,
        "total_hours": 0,
        "most_active_user": None,
    }


def test_summary_and_most_active(client):
    add(client, "Rahul", "Football", 3)
    add(client, "Priya", "Music", 2)
    add(client, "Priya", "Chess", 4)
    summary = client.get("/summary").get_json()
    assert summary == {
        "total_entries": 3,
        "total_students": 2,
        "total_hours": 9.0,
        "most_active_user": "Priya",
    }


def test_delete_existing_and_summary_updates(client):
    add(client, "Rahul", "Football", 3)
    add(client, "Priya", "Music", 5)
    res = client.delete("/activities/2")
    assert res.status_code == 200
    summary = client.get("/summary").get_json()
    assert summary["total_entries"] == 1
    assert summary["most_active_user"] == "Rahul"


def test_delete_missing_returns_404(client):
    res = client.delete("/activities/999")
    assert res.status_code == 404
    assert res.get_json()["error"]["status"] == 404


def test_chart_endpoints(client):
    add(client, "Rahul", "Football", 3)
    add(client, "Rahul", "Chess", 1)
    students = client.get("/summary/students").get_json()["data"]
    assert students == [{"name": "Rahul", "hours": 4.0, "entries": 2}]
    acts = client.get("/summary/activities").get_json()["data"]
    assert acts[0]["activity"] == "Football"


def test_unknown_route_is_json_404(client):
    res = client.get("/nope")
    assert res.status_code == 404
    assert "error" in res.get_json()
