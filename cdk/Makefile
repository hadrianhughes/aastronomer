venv:
	. ./venv/bin/activate

run_tests:
	pytest lambda/

deploy-all: run_tests
	cdk deploy --all

deploy: run_tests
	cdk deploy PlanetsStack
