from .index import handler


def test_success():
    request = {
        'pathParameters': {
            'id': '35-356-5-6'
        }
    }

    response = handler(request, {})

    assert response['statusCode'] == 200
    assert response['body'] == '35-356-5-6'


def test_bad_format():
    request = {
        'pathParameters': {
            'id': '10-20-30'
        }
    }

    response = handler(request, {})

    assert response['statusCode'] == 404


def test_bad_x_zone():
    request = {
        'pathParameters': {
            'id': '0-0-15-0'
        }
    }

    response = handler(request, {})

    assert response['statusCode'] == 404


def test_bad_y_zone():
    request = {
        'pathParameters': {
            'id': '0-0-0-15'
        }
    }

    response = handler(request, {})

    assert response['statusCode'] == 404
