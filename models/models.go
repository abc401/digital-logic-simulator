package models

import (
	"database/sql"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type HashedString string

type User struct {
	gorm.Model
	UName    string       `gorm:"not null"`
	Email    string       `gorm:"not null unique"`
	Password HashedString `gorm:"not null"`
}

func (user *User) SetPassword(password string) error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err == nil {
		user.Password = HashedString(bytes)
	}
	return err

}

func (user *User) VerifyPassword(providedPassword string) error {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(providedPassword))
	if err != nil {
		return err
	}
	return nil
}

type Article struct {
	ID           uint   `gorm:"primarykey"`
	LinkTitle    string `gorm:"index"`
	DisplayTitle string
	Content      string
	Previous     sql.NullString
	Next         sql.NullString
	MCQs         []MCQ
}

type MCQ struct {
	ID            uint   `gorm:"primarykey" json:"id"`
	Statement     string `json:"stmt"`
	Option1       string `json:"o1"`
	Option2       string `json:"o2"`
	Option3       string `json:"o3"`
	Option4       string `json:"o4"`
	CorrectOption uint   `json:"correctOption"`
	ArticleID     uint   `gorm:"index" json:"articleID"`
}
