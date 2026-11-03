"""Business logic for activities and summary statistics.

Routes stay thin: they parse the request, call into this module and
translate the result (or a ServiceError) into an HTTP response.
"""
import math

from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from models import Activity, db

NAME_MAX = 100
ACTIVITY_MAX = 150
HOURS_MAX = 24 * 365  # sanity ceiling for a single entry


class ServiceError(Exception):
    """Error raised by the service layer with an HTTP status and safe message."""

    def __init__(self, message, status=400, details=None):
        super().__init__(message)
        self.message = message
        self.status = status
        self.details = details or {}


def _validate_payload(payload):
    if not isinstance(payload, dict):
        raise ServiceError("Request body must be a JSON object.", 400)

    errors = {}

    name = payload.get("name")
    if not isinstance(name, str) or not name.strip():
        errors["name"] = "Student name is required."
    elif len(name.strip()) > NAME_MAX:
        errors["name"] = f"Student name must be at most {NAME_MAX} characters."

    activity = payload.get("activity")
    if not isinstance(activity, str) or not activity.strip():
        errors["activity"] = "Activity is required."
    elif len(activity.strip()) > ACTIVITY_MAX:
        errors["activity"] = f"Activity must be at most {ACTIVITY_MAX} characters."

    raw_hours = payload.get("hours")
    hours = None
    if raw_hours is None or (isinstance(raw_hours, str) and not raw_hours.strip()):
        errors["hours"] = "Hours is required."
    elif isinstance(raw_hours, bool):
        errors["hours"] = "Hours must be a valid number."
    else:
        try:
            hours = float(raw_hours)
            if not math.isfinite(hours):
                raise ValueError
        except (TypeError, ValueError):
            errors["hours"] = "Hours must be a valid number."
        else:
            if hours <= 0:
                errors["hours"] = "Hours must be greater than zero."
            elif hours > HOURS_MAX:
                errors["hours"] = f"Hours must not exceed {HOURS_MAX}."

    if errors:
        raise ServiceError("Validation failed.", 400, errors)

    return name.strip(), activity.strip(), round(hours, 2)


def create_activity(payload):
    name, activity, hours = _validate_payload(payload)
    record = Activity(name=name, activity=activity, hours=hours)
    try:
        db.session.add(record)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        raise ServiceError("Could not save the activity. Please try again.", 500) from exc
    return record.to_dict()


def list_activities():
    try:
        records = Activity.query.order_by(Activity.created_at.desc(), Activity.id.desc()).all()
    except SQLAlchemyError as exc:
        raise ServiceError("Could not load activities.", 500) from exc
    return [r.to_dict() for r in records]


def delete_activity(activity_id):
    try:
        record = db.session.get(Activity, activity_id)
    except SQLAlchemyError as exc:
        raise ServiceError("Could not delete the activity.", 500) from exc

    if record is None:
        raise ServiceError(f"Activity with id {activity_id} was not found.", 404)

    try:
        db.session.delete(record)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        raise ServiceError("Could not delete the activity.", 500) from exc
    return record.id


def get_summary():
    try:
        total_entries, total_hours = db.session.query(
            func.count(Activity.id), func.coalesce(func.sum(Activity.hours), 0)
        ).one()
        total_students = db.session.query(func.count(func.distinct(Activity.name))).scalar() or 0

        top = (
            db.session.query(Activity.name, func.sum(Activity.hours).label("hours"))
            .group_by(Activity.name)
            .order_by(func.sum(Activity.hours).desc(), Activity.name.asc())
            .first()
        )
    except SQLAlchemyError as exc:
        raise ServiceError("Could not load summary.", 500) from exc

    return {
        "total_entries": int(total_entries),
        "total_students": int(total_students),
        "total_hours": round(float(total_hours), 2),
        "most_active_user": top[0] if top else None,
    }


def get_student_hours():
    """Accumulated hours per student, highest first (used for dashboard charts)."""
    try:
        rows = (
            db.session.query(
                Activity.name,
                func.sum(Activity.hours).label("hours"),
                func.count(Activity.id).label("entries"),
            )
            .group_by(Activity.name)
            .order_by(func.sum(Activity.hours).desc(), Activity.name.asc())
            .all()
        )
    except SQLAlchemyError as exc:
        raise ServiceError("Could not load student statistics.", 500) from exc
    return [{"name": r.name, "hours": round(float(r.hours), 2), "entries": int(r.entries)} for r in rows]


def get_activity_hours():
    """Accumulated hours per activity type, highest first (used for dashboard charts)."""
    try:
        rows = (
            db.session.query(
                Activity.activity,
                func.sum(Activity.hours).label("hours"),
                func.count(Activity.id).label("entries"),
            )
            .group_by(Activity.activity)
            .order_by(func.sum(Activity.hours).desc(), Activity.activity.asc())
            .all()
        )
    except SQLAlchemyError as exc:
        raise ServiceError("Could not load activity statistics.", 500) from exc
    return [{"activity": r.activity, "hours": round(float(r.hours), 2), "entries": int(r.entries)} for r in rows]
