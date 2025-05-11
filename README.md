# Commander

A powerful CLI tool to manage code challenges with Go.

## Usage

After downloading the repository, run the to install dependencies and build the
project:

```bash
go mod tidy
go build -o commander .
```

You can also try a showcase of the tool by running the following command:

```bash
commander scripts
```

This will run all files in the `tests` directory with the `.ts` and `.js`
extensions as long as you have deno and node installed.

---

See the help message for usage information:

```bash
commander -h
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
