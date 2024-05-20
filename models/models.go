package models

import (
	"database/sql"
)

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
	ID            uint `gorm:"primarykey"`
	Statement     string
	Option1       string
	Option2       string
	Option3       string
	Option4       string
	CorrectOption uint
	ArticleID     uint `gorm:"index"`
}
