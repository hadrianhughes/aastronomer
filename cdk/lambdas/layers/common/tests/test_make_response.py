import json
from ..common import make_response


def test_basic():
    response = make_response(200)

    assert response['statusCode'] == 200
    assert response['headers']['Content-Type'] == 'text/plain'
    assert response['body'] == ''


def test_json():
    response = make_response(200, is_json=True)

    assert response['statusCode'] == 200
    assert response['headers']['Content-Type'] == 'application/json'
    assert response['body'] == json.dumps({})


def test_headers():
    response = make_response(200, headers={'foo': 'bar'})

    assert response['headers']['foo'] == 'bar'


def test_body():
    response = make_response(200, 'bar')

    assert response['body'] == 'bar'


def test_json_body():
    response = make_response(200, {'foo': 'bar'}, is_json=True)

    assert json.loads(response['body'])['foo'] == 'bar'
