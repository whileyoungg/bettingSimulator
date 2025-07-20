package io.persistence;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.datarecords.MonoBankDeposit;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class DepositRepository {
    private static long lastFetchTime = 0;
    private static String cachedAccountId = null;
    private String getToken() {
        Properties prop = new Properties();
        try (InputStream dbProperties = DepositRepository.class.getClassLoader().getResourceAsStream("token.properties");
        ) {
            prop.load(dbProperties);
            return prop.getProperty("token");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<MonoBankDeposit> getLatestTransactions() throws PersistenceException {
        List<MonoBankDeposit> deposits = new ArrayList<>();
        String token = getToken();
        if (token == null) {
            throw new PersistenceException("No token found");
        }
        String accountId = getMainAccountId(token);
        if (accountId == null) {
            throw new PersistenceException("Internal account issue");
        }
        long from = Instant.now().minusSeconds(60).getEpochSecond();
        long to = Instant.now().getEpochSecond();
        String url = String.format("https://api.monobank.ua/personal/statement/0/%d/%d", from, to);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(url);
            request.setHeader("X-Token", token);
            String response = client.execute(request, httpResponse ->
                    EntityUtils.toString(httpResponse.getEntity()));
            ObjectMapper mapper = new ObjectMapper();
            JsonNode transactions = mapper.readTree(response);
            for (JsonNode tx : transactions) {
                long time = tx.get("time").asLong();
                double amount = tx.get("amount").asDouble()/100;
                String description = tx.has("description") ? tx.get("description").asText() : "N/A";
                if(amount>=0){
                    MonoBankDeposit mbd = new MonoBankDeposit(amount, description, Instant.ofEpochSecond(time));
                    deposits.add(mbd);
                 }
            }
            return deposits;
        } catch (IOException e) {
            throw new PersistenceException("Deposits are not gathered");
        }
    }
    public String getMainAccountId(String token) throws PersistenceException {
        long now = System.currentTimeMillis();
        if (cachedAccountId != null && now - lastFetchTime < 61000) {
            return cachedAccountId;
        }
        String url = "https://api.monobank.ua/personal/client-info";
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(url);
            request.setHeader("X-Token", token);
            String response = client.execute(request, httpResponse ->
                    EntityUtils.toString(httpResponse.getEntity()));
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(response);
            JsonNode accounts = node.get("accounts");
            if (accounts == null || !accounts.isArray() || accounts.isEmpty()) {
                return null;
            }
            cachedAccountId = accounts.get(0).get("id").asText();
            lastFetchTime = now;
            return cachedAccountId;
        } catch (IOException e) {
            throw new PersistenceException("Failed to get Monobank account ID: " + e.getMessage());
        }
    }
    public List<MonoBankDeposit> getLatestWithdrawal() throws PersistenceException {
        List<MonoBankDeposit> deposits = new ArrayList<>();
        String token = getToken();
        if (token == null) {
            throw new PersistenceException("No token found");
        }
        String accountId = getMainAccountId(token);
        if (accountId == null) {
            throw new PersistenceException("Internal account issue");
        }
        long from = Instant.now().minusSeconds(600).getEpochSecond();
        long to = Instant.now().getEpochSecond();
        String url = String.format("https://api.monobank.ua/personal/statement/0/%d/%d", from, to);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(url);
            request.setHeader("X-Token", token);
            String response = client.execute(request, httpResponse ->
                    EntityUtils.toString(httpResponse.getEntity()));
            ObjectMapper mapper = new ObjectMapper();
            JsonNode transactions = mapper.readTree(response);
            System.out.println(transactions);

            for (JsonNode tx : transactions) {
                long time = tx.get("time").asLong();
                double amount = tx.get("amount").asDouble()/100;
                String description = tx.has("description") ? tx.get("description").asText() : "N/A";
                if(amount<0){
                    MonoBankDeposit mbd = new MonoBankDeposit(amount, description, Instant.ofEpochSecond(time));
                    deposits.add(mbd);
                }
            }
            return deposits;
        } catch (IOException e) {
            throw new PersistenceException("Deposits are not gathered");
        }
    }

}


