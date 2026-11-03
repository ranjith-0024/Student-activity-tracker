"""Dashboard summary endpoints."""
from flask import Blueprint, jsonify

from services import activity_service

summary_bp = Blueprint("summary", __name__)


@summary_bp.get("/summary")
def get_summary():
    return jsonify(activity_service.get_summary()), 200


@summary_bp.get("/summary/students")
def get_student_hours():
    return jsonify({"data": activity_service.get_student_hours()}), 200


@summary_bp.get("/summary/activities")
def get_activity_hours():
    return jsonify({"data": activity_service.get_activity_hours()}), 200
