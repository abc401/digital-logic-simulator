package db

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/models"
	"github.com/go-sql-driver/mysql"
	gormDb "gorm.io/driver/mysql"
	"gorm.io/gorm"
)

const Dsn = "root:1234@tcp(localhost:3306)/dls"

var cfg = mysql.Config{
	User:   "root",
	Passwd: "1234",
	Net:    "tcp",
	Addr:   "127.0.0.1:3306",
	DBName: "dls",
}

func GetDBCon() *sql.DB {
	db, err := sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		panic(err.Error())
	}
	return db
}

func GetGormDBCon() *gorm.DB {
	db, err := gorm.Open(gormDb.Open(cfg.FormatDSN()), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}
	return db

}

func AutoMigrate() {
	db := GetGormDBCon()
	err := db.AutoMigrate(&models.Article{})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Could not auto migrate: %s\n", err.Error())
		panic("")
	}
	err = db.AutoMigrate(&models.MCQ{})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Could not auto migrate: %s\n", err.Error())
		panic("")
	}
	fmt.Println("Successfully auto migrated")
}

func ConfigNextAndPrevious(tutorials []*models.Article) {
	for i := 0; i < len(tutorials); i++ {
		if i == 0 {
			tutorials[i].Previous = sql.NullString{}
		} else {
			tutorials[i].Previous = sql.NullString{
				String: tutorials[i-1].LinkTitle,
				Valid:  true,
			}
		}

		if i == len(tutorials)-1 {
			tutorials[i].Next = sql.NullString{}
		} else {
			tutorials[i].Next = sql.NullString{
				String: tutorials[i+1].LinkTitle,
				Valid:  true,
			}

		}
	}

}

func AddTutorials(tutorials []*models.Article) {
	fmt.Println("[Info] Adding tutorials")
	db := GetGormDBCon()
	db.Exec("delete from mcqs")
	db.Exec("delete from articles")

	ConfigNextAndPrevious(tutorials)
	for i := 0; i < len(tutorials); i++ {
		AddTutorial(tutorials[i])
		// var tutorial = tutorials[i]
		// if tutorial.LinkTitle == "" {
		// 	panic("Title of tutorial is not defined")
		// }
		// if tutorial.Content == "" {
		// 	panic("Content of tutorial is not defined")
		// }
		// db.Create(tutorial)
	}
}

func AddTutorial(tutorial *models.Article) {
	if tutorial.LinkTitle == "" {
		panic("Title of tutorial is not defined")
	}
	if tutorial.Content == "" {
		panic("Content of tutorial is not defined")
	}

	fmt.Println("[Info] Creating record in db: ", tutorial.LinkTitle)
	db := GetGormDBCon()
	db.Create(&tutorial)

	content, err := os.ReadFile(fmt.Sprintf("quiz/%s.txt", tutorial.LinkTitle))
	if err != nil {
		content = []byte("")
		fmt.Println("[Error] ", err.Error())
	}

	fmt.Println("Printing Mcqs lines: ", tutorial.LinkTitle)
	lines := strings.Split(string(content), "\n")

	lineIdx := SkipEmptyLines(lines, 0)

	mcqs := []*models.MCQ{}
	for lineIdx < len(lines) {

		mcq := models.MCQ{}

		line := strings.Trim(lines[lineIdx], "\r \t")
		mcq.Statement = line

		lineIdx++
		lineIdx = SkipEmptyLines(lines, lineIdx)

		line = strings.Trim(lines[lineIdx], "\r \t")
		mcq.Option1 = line

		lineIdx++
		lineIdx = SkipEmptyLines(lines, lineIdx)

		line = strings.Trim(lines[lineIdx], "\r \t")
		mcq.Option2 = line

		lineIdx++
		lineIdx = SkipEmptyLines(lines, lineIdx)

		line = strings.Trim(lines[lineIdx], "\r \t")
		mcq.Option3 = line

		lineIdx++
		lineIdx = SkipEmptyLines(lines, lineIdx)

		line = strings.Trim(lines[lineIdx], "\r \t")
		mcq.Option4 = line

		lineIdx++
		lineIdx = SkipEmptyLines(lines, lineIdx)

		line = strings.Trim(lines[lineIdx], "\r \t")
		num, err := strconv.ParseInt(line, 10, 64)
		if err != nil {
			fmt.Printf("[Info] tutorial: %s\n", tutorial.LinkTitle)
			fmt.Printf("[Info] line number: %d\n", lineIdx)
			fmt.Printf("MCQ: %s\n", helpers.SPrettyPrint(mcq))
			panic("")
		}
		mcq.CorrectOption = uint(num)

		lineIdx++
		lineIdx = SkipEmptyLines(lines, lineIdx)

		mcq.ArticleID = tutorial.ID
		mcqs = append(mcqs, &mcq)
	}

	// fmt.Printf("MCQ: %s\n", helpers.SPrettyPrint(mcqs))
	db.Create(mcqs)
	fmt.Printf("MCQ: %s\n", helpers.SPrettyPrint(mcqs))

}

func SkipEmptyLines(lines []string, startLineIdx int) int {
	for startLineIdx < len(lines) {
		line := lines[startLineIdx]
		trimmed := strings.Trim(line, "\r \t")

		if trimmed != "" {
			break
		}
		startLineIdx++
	}
	return startLineIdx
}
