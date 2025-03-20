from flask import Flask
from app.config import Config
from app.controladores.main import main_bp
from app.controladores.api import api_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)

    return app
