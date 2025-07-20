package io.businessLogic;

import io.datarecords.MonoBankDeposit;
import io.persistence.DepositRepository;
import io.persistence.PersistenceException;

import java.util.List;

public class DepositLogic {
    private DepositRepository depositRepository;

    public DepositLogic(DepositRepository depositRepository) {
        this.depositRepository = depositRepository;
    }

}
