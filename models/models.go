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
	ID            uint   `gorm:"primarykey" json:"id"`
	Statement     string `json:"stmt"`
	Option1       string `json:"o1"`
	Option2       string `json:"o2"`
	Option3       string `json:"o3"`
	Option4       string `json:"o4"`
	CorrectOption uint   `json:"correctOption"`
	ArticleID     uint   `gorm:"index" json:"articleID"`
}
