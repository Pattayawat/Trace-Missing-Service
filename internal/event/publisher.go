package event

import (
	"encoding/json"
	"fmt"
)

func PublishMissingCaseCreated(event MissingCaseCreatedEvent) error {

	data, err := json.Marshal(event)
	if err != nil {
		return err
	}

	// mock publish
	fmt.Println("Publishing to topic: missing.case.created")
	fmt.Println(string(data))

	return nil
}