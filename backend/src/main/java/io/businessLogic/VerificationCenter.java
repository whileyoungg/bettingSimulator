package io.businessLogic;
import io.datarecords.Verification;
import org.mindrot.jbcrypt.BCrypt;

public class VerificationCenter {
    public static boolean validateVerificationData(Verification v) throws VerificationException {
        if (v.firstName() == null || !v.firstName().matches("^[A-Za-zÀ-ÿА-Яа-я' -]{2,50}$")) {
            throw new VerificationException("Invalid first name");
        }
        if (v.lastName() == null || !v.lastName().matches("^[A-Za-zÀ-ÿА-Яа-я' -]{2,50}$")) {
            throw new VerificationException("Invalid last name");
        }
        if (!String.valueOf(v.bsn()).matches("^\\d{8,9}$") || !isValidBSN(v.bsn())) {
            throw new VerificationException("Invalid BSN");
        }
        if (v.iban() == null || !v.iban().matches("^NL\\d{2}[A-Z]{4}\\d{10}$")) {
            throw new VerificationException("Invalid IBAN");
        }
        if (v.address() == null || !v.address().matches("^.{5,100}$")) {
            throw new VerificationException("Invalid address");
        }
        if (v.postalCode() == null || !v.postalCode().matches("^\\d{4}\\s?[A-Z]{2}$")) {
            throw new VerificationException("Invalid postal code");
        }
        if (v.phoneNumber() == null || v.phoneNumber().matches("^(\\+31|0)[1-9]\\d{8}$")) {
            throw new VerificationException("Invalid Dutch phone number");
        }
        return true;
    }
    private static boolean isValidBSN(String bsn) {
        int bsnInt = Integer.parseInt(bsn);
        String bsnStr = String.format("%09d", bsnInt);
        int total = 0;
        for (int i = 0; i < 8; i++) {
            total += (bsnStr.charAt(i) - '0') * (9 - i);
        }
        total -= (bsnStr.charAt(8) - '0');
        return total % 11 == 0;
    }
    public static Verification encryptVerificationData(Verification v) throws VerificationException {
            String encryptedBSN = BCrypt.hashpw(String.valueOf(v.bsn()), BCrypt.gensalt());
            String encryptedIban = BCrypt.hashpw(v.iban(), BCrypt.gensalt());
            String encryptedAddress = BCrypt.hashpw(v.address(), BCrypt.gensalt());
            String encryptedPostalCode = BCrypt.hashpw(v.postalCode(), BCrypt.gensalt());
            return new Verification(
                    v.user(),
                    v.firstName(),
                    v.lastName(),
                    encryptedBSN,
                    encryptedIban,
                    encryptedAddress,
                    encryptedPostalCode,
                    v.phoneNumber()
            );
        }
}
