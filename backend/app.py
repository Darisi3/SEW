from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import config
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(config)
    
    # Initialize CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5500", "http://127.0.0.1:5500"],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize database
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Create upload directory
    if not os.path.exists(config.UPLOAD_FOLDER):
        os.makedirs(config.UPLOAD_FOLDER)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.images import images_bp
    from routes.ocr import ocr_bp
    from routes.search import search_bp
    from routes.download import download_bp
    
    app.register_blueprint(auth_bp, url_prefix=config.API_PREFIX)
    app.register_blueprint(images_bp, url_prefix=config.API_PREFIX)
    app.register_blueprint(ocr_bp, url_prefix=config.API_PREFIX)
    app.register_blueprint(search_bp, url_prefix=config.API_PREFIX)
    app.register_blueprint(download_bp, url_prefix=config.API_PREFIX)
    
    @app.route('/')
    def index():
        return {'message': 'Gazeta Generator API', 'version': '1.0.0'}
    
    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'database': 'connected'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)