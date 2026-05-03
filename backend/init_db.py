from database import SessionLocal, engine
import models
import auth

def init_db():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if admin exists
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin:
        print("Creating default admin user...")
        hashed_password = auth.get_password_hash("admin")
        admin_user = models.User(username="admin", password_hash=hashed_password, role="admin")
        db.add(admin_user)
        db.commit()
        print("Admin user created successfully! (username: admin, password: admin)")
    else:
        print("Admin user already exists.")
    
    db.close()

if __name__ == "__main__":
    init_db()
