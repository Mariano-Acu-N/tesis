from flask import Blueprint, render_template
import time

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def home():
    return render_template('index.html')


@main_bp.route('/faq')
def faq():
    return render_template('faq.html')


@main_bp.route('/api')
def api():
    return render_template('api.html')