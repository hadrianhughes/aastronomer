import json
from ..common import make_response


def test_basic():
    response = make_response(200)

    assert response['statusCode'] == 200
    assert response['headers']['Content-Type'] == 'application/json'
    assert response['body'] == json.dumps({})


def test_headers():
    response = make_response(200, headers={'foo': 'bar'})

    assert response['headers']['Content-Type'] == 'application/json'
    assert response['headers']['foo'] == 'bar'


def test_body():
    response = make_response(200, {'foo': 'bar'})

    assert json.loads(response['body'])['foo'] == 'bar'
