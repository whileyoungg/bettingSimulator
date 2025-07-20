package io.controller;

public record VerificationRequest(String username, String firstName, String lastName, String bsn, String iban, String address, String postalCode, String phoneNumber) {
}
