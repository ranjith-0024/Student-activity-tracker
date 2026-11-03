"""Flask application entry point for the Student Activity Tracker API."""
import logging
import os

from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from config import Config
from models import db
from routes.activities import activities_bp
from routes.summary import summary_bp
from services.activity_service import ServiceError

logger = logging.getLogger(__name__)


def error_response(message, status, details=None):
    body = {"error": {"status": status, "message": message}}
    if details:
        body["error"]["details"] = details
    return jsonify(body), status


def register_error_handlers(app):
    @app.errorhandler(ServiceError)
    def handle_service_error(err):
        if err.status >= 500:
            logger.exception("Service error: %s", err.message)
        return error_response(err.message, err.status, err.details)

    @app.errorhandler(HTTPException)
    def handle_http_error(err):
        messages = {
            404: "The requested resource was not found.",
            405: "Method not allowed for this endpoint.",
        }
        return error_response(messages.get(err.code, err.description), err.code)

    @app.errorhandler(Exception)
    def handle_unexpected(err):
        logger.exception("Unhandled error")
        return error_response("An unexpected error occurred. Please try again.", 500)


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.json.sort_keys = False  # keep response fields in the documented order

    CORS(app, resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}})
    db.init_app(app)

    app.register_blueprint(activities_bp)
    app.register_blueprint(summary_bp)
    register_error_handlers(app)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    uri = app.config["SQLALCHEMY_DATABASE_URI"]
    if uri.startswith("sqlite:///") and ":memory:" not in uri:
        os.makedirs(os.path.dirname(uri.replace("sqlite:///", "", 1)), exist_ok=True)

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    app.run(host=app.config["HOST"], port=app.config["PORT"], debug=app.config["DEBUG"])
