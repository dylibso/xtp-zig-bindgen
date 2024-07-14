// Note: run `go doc -all` in this package to see all of the types and functions available.
// ./pdk.gen.go contains the domain types from the host where your plugin will run.
package main

// This demonstrates how you can create an export with
// no inputs or outputs.
func voidFunc() error {
	// TODO: fill out your implementation here
	panic("Function not implemented.")
}

// This demonstrates how you can pass arrays in and out
// It takes []Fruit as input (Array of fruit)
// And returns []bool (An array)
func arrayFunc(input []Fruit) ([]bool, error) {
	// TODO: fill out your implementation here
	panic("Function not implemented.")
}

// This demonstrates how you can accept or return primtive types.
// This function takes a utf8 string and returns a json encoded boolean
// It takes string as input (A string passed into plugin input)
// And returns bool (A boolean encoded as json)
func primitiveTypeFunc(input string) (bool, error) {
	// TODO: fill out your implementation here
	panic("Function not implemented.")
}

// This demonstrates how you can accept or return references to schema types.
// And it shows how you can define an enum to be used as a property or input/output.
// It takes Fruit as input (A set of available fruits you can consume)
// And returns ComplexObject (A complex json object)
func referenceTypeFunc(input Fruit) (ComplexObject, error) {
	// TODO: fill out your implementation here
	panic("Function not implemented.")
}
