"""Activity endpoints: create, list, delete."""
from flask import Blueprint, jsonify, request

from services import activity_service
from services.activity_service import ServiceError

activities_bp = Blueprint("activities", __name__)


@activities_bp.post("/activities")
def create_activity():
    payload = request.get_json(silent=True)
    if payload is None:
        raise ServiceError("Request body must be valid JSON.", 400)
    record = activity_service.create_activity(payload)
    return jsonify({"message": "Activity created successfully.", "data": record}), 201


@activities_bp.get("/activities")
def list_activities():
    records = activity_service.list_activities()
    return jsonify({"data": records, "count": len(records)}), 200


@activities_bp.delete("/activities/<int:activity_id>")
def delete_activity(activity_id):
    deleted_id = activity_service.delete_activity(activity_id)
    return jsonify({"message": "Activity deleted successfully.", "id": deleted_id}), 200
