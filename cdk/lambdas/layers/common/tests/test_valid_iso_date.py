from ..common import valid_iso_date


def test_valid():
    assert valid_iso_date('2020-11-30T16:16:54.567Z') is True
    assert valid_iso_date('2020-11-30') is True


def test_invalid():
    assert valid_iso_date('foobar') is False
