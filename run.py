from app import start

app = start.create_app()

if __name__ == '__main__':
    app.run(debug=True)
