package helper

import "strings"

func FormatPhone(number string) string {
	if strings.HasPrefix(number, "0") {
		return "62" + number[1:]
	}
	return number
}