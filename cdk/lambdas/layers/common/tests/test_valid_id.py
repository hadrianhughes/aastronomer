from ..common import valid_id


def test_valid():
    assert valid_id('0-0-0-0') is True


def test_invalid():
    assert valid_id('10-20-30') is False
