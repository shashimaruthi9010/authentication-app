from sqlalchemy import Column, Integer, String
from app.database import Base


class User(Base):
    """
    ORM model for the 'users' table.
    Stores user authentication information with a hashed password.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"
