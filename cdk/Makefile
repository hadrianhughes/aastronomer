venv:
	. ./venv/bin/activate

run_tests:
	pytest lambda/

deploy: run_tests
	cdk deploy
