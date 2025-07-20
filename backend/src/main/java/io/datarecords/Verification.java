package io.datarecords;

import java.time.LocalDate;

public record Verification(User user, String firstName, String lastName, String bsn, String iban, String address, String postalCode, String phoneNumber) {
}
