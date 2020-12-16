venv:
	. ./venv/bin/activate

symlinks:
	ln -s $(shell pwd)/lambdas/layers/astro $(shell pwd)/venv/lib/python3.8/site-packages/astro
	ln -s $(shell pwd)/lambdas/layers/common $(shell pwd)/venv/lib/python3.8/site-packages/common
	ln -s $(shell pwd)/lambdas/layers/geo $(shell pwd)/venv/lib/python3.8/site-packages/geo

run_tests:
	cp -r ./lambdas/layers/geo ./lambdas/edge/query_to_id
	rm -rf ./lambdas/edge/query_to_id/geo/tests
	python3 -m pytest ./lambdas
	rm -rf ./lambdas/edge/query_to_id/geo

deploy: run_tests
	cp -r ./lambdas/layers/geo ./lambdas/edge/query_to_id
	rm -rf ./lambdas/edge/query_to_id/geo/tests
	cdk deploy --all
	rm -rf ./lambdas/edge/query_to_id/geo
