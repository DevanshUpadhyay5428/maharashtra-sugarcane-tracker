package com.mahacane;

import com.mahacane.model.*;
import com.mahacane.repository.DataStore;
import com.mahacane.service.*;
import com.mahacane.util.JsonUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.Executors;

/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER (MahaCaneGrid)
 * Pure Java Embedded Application Server & REST API Engine
 * ============================================================================
 * Architecture:
 *   - Embedded JDK HttpServer (Zero External Dependencies)
 *   - Layered Model-Service-Repository Enterprise Architecture
 *   - High-throughput multi-threaded HTTP request dispatch
 *   - Real-time FRP Quality Pricing & Haversine GIS corridor calculations
 * ============================================================================
 */
public class Main {

    private static final int DEFAULT_PORT = 8080;
    private static final AuthService authService = new AuthService();
    private static final TripService tripService = new TripService();
    private static final MillService millService = new MillService();
    private static final RouteService routeService = new RouteService();
    private static final FrpCalculatorService frpService = new FrpCalculatorService();
    private static final ClimateService climateService = new ClimateService();
    private static final DataStore dataStore = DataStore.getInstance();

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        if (args.length > 0) {
            try { port = Integer.parseInt(args[0]); } catch (Exception ignored) {}
        }

        HttpServer server = null;
        while (server == null && port < DEFAULT_PORT + 20) {
            try {
                server = HttpServer.create(new InetSocketAddress(port), 0);
            } catch (IOException e) {
                port++;
            }
        }

        if (server == null) {
            System.err.println("❌ Could not bind HTTP server to any port between 8080 and 8100.");
            System.exit(1);
        }

        // Configure Worker Thread Pool
        server.setExecutor(Executors.newFixedThreadPool(16));

        // Register REST API Handlers
        server.createContext("/api/info", new InfoHandler());
        server.createContext("/api/state", new StateHandler());
        server.createContext("/api/auth/login", new LoginHandler());
        server.createContext("/api/auth/logout", new LogoutHandler());
        server.createContext("/api/trips", new TripsHandler());
        server.createContext("/api/trips/award", new AwardBidHandler());
        server.createContext("/api/bids", new SubmitBidHandler());
        server.createContext("/api/frp/calculate", new FrpCalculateHandler());
        server.createContext("/api/weighbridge/log", new WeighbridgeLogHandler());
        server.createContext("/api/massbalance/upsert", new MassBalanceUpsertHandler());
        server.createContext("/api/massbalance/delete", new MassBalanceDeleteHandler());
        server.createContext("/api/route/calculate", new RouteCalculateHandler());
        server.createContext("/api/climate", new ClimateHandler());
        server.createContext("/api/reset", new ResetHandler());

        // Register Static File Web Handler
        server.createContext("/", new StaticFileHandler());

        server.start();

        printBanner(port);
    }

    private static void printBanner(int port) {
        System.out.println("============================================================================");
        System.out.println("     __  __       _           ____                  ____      _     _ ");
        System.out.println("    |  \\/  | __ _| |__   __ _/ ___|__ _ _ __   ___ / ___|_ __(_) __| |");
        System.out.println("    | |\\/| |/ _` | '_ \\ / _` | |   / _` | '_ \\ / _ \\ |  _| '__| |/ _` |");
        System.out.println("    | |  | | (_| | | | | (_| | |__| (_| | | | |  __/ |_| | |  | | (_| |");
        System.out.println("    |_|  |_|\\__,_|_| |_|\\__,_|\\____\\__,_|_| |_|\\___|\\____|_|  |_|\\__,_|");
        System.out.println("============================================================================");
        System.out.println("  ☕ Java Sugarcane Supply Chain Backend Engine Online");
        System.out.println("  📍 Server URL:           http://localhost:" + port);
        System.out.println("  🌐 Java Version:         " + System.getProperty("java.version") + " (" + System.getProperty("java.vendor") + ")");
        System.out.println("  🚀 Java Architecture:    " + System.getProperty("os.arch") + " / " + System.getProperty("os.name"));
        System.out.println("  ⚡ Built-in REST APIs:    /api/state, /api/trips, /api/frp/calculate, etc.");
        System.out.println("  📂 Root Path:            " + Paths.get(".").toAbsolutePath().normalize());
        System.out.println("============================================================================");
        System.out.println("  👉 Open http://localhost:" + port + " in your browser to view the application.");
        System.out.println("============================================================================");
    }

    // ========================================================================
    // REST API HANDLERS
    // ========================================================================

    static class InfoHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            Map<String, Object> info = new LinkedHashMap<>();
            info.put("status", "ONLINE");
            info.put("system", "Maharashtra Sugarcane Supply Chain Tracker (MahaCaneGrid)");
            info.put("language", "Java");
            info.put("javaVersion", System.getProperty("java.version"));
            info.put("javaVendor", System.getProperty("java.vendor"));
            info.put("activeTripsCount", dataStore.getTrips().size());
            info.put("weighbridgeBatchesCount", dataStore.getWeighbridgeBatches().size());
            info.put("massBalanceRecordsCount", dataStore.getMassBalanceLedger().size());

            sendJsonResponse(exchange, 200, JsonUtil.toJson(info));
        }
    }

    static class StateHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            Map<String, Object> state = new LinkedHashMap<>();
            state.put("currentUser", dataStore.getCurrentUser());
            state.put("activeRoute", dataStore.getActiveRoute());
            state.put("trips", dataStore.getTrips());
            state.put("weighbridgeBatches", dataStore.getWeighbridgeBatches());
            state.put("massBalanceLedger", dataStore.getMassBalanceLedger());
            state.put("mills", dataStore.getSugarMills());
            state.put("ensoRecords", dataStore.getEnsoRecords());
            state.put("rainfallRecords", dataStore.getRainfallRecords());

            sendJsonResponse(exchange, 200, JsonUtil.toJson(state));
        }
    }

    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, Object> params = JsonUtil.parseJsonObject(body);

            String role = JsonUtil.getString(params, "role", "farmer");
            String name = JsonUtil.getString(params, "name", null);
            String phone = JsonUtil.getString(params, "phone", null);
            String district = JsonUtil.getString(params, "district", null);

            User user = authService.loginWithRole(role, name, phone, district);
            sendJsonResponse(exchange, 200, JsonUtil.toJson(user));
        }
    }

    static class LogoutHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            authService.logout();
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            sendJsonResponse(exchange, 200, JsonUtil.toJson(res));
        }
    }

    static class TripsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 200, JsonUtil.toJson(tripService.getAllTrips()));
            } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readRequestBody(exchange);
                Map<String, Object> map = JsonUtil.parseJsonObject(body);

                Trip trip = new Trip();
                trip.setFarmerId(JsonUtil.getString(map, "farmerId", "MH-FRM-1042"));
                trip.setFarmerName(JsonUtil.getString(map, "farmerName", "Rajendra Dattatray Patil"));
                trip.setPlotId(JsonUtil.getString(map, "plotId", "PLOT-USER"));
                trip.setPlotAddress(JsonUtil.getString(map, "plotAddress", "Plot Address, Maharashtra"));
                trip.setDistrict(JsonUtil.getString(map, "district", "Kolhapur"));
                trip.setPlotLat(JsonUtil.getDouble(map, "plotLat", 16.6912));
                trip.setPlotLng(JsonUtil.getDouble(map, "plotLng", 74.2448));
                trip.setTargetMillId(JsonUtil.getString(map, "targetMillId", "MILL-KOP-01"));
                trip.setTargetMillName(JsonUtil.getString(map, "targetMillName", "Shree Datta SSK Ltd."));
                trip.setMillLat(JsonUtil.getDouble(map, "millLat", 16.7325));
                trip.setMillLng(JsonUtil.getDouble(map, "millLng", 74.6042));
                trip.setCaneVariety(JsonUtil.getString(map, "caneVariety", "Co 86032"));
                trip.setCropType(JsonUtil.getString(map, "cropType", "Adsali"));
                trip.setQuantityMt(JsonUtil.getDouble(map, "quantityMt", 40.0));
                trip.setHarvestDate(JsonUtil.getString(map, "harvestDate", "2026-10-18"));
                trip.setHarvestWindow(JsonUtil.getString(map, "harvestWindow", "06:00 AM – 10:00 AM"));

                Trip created = tripService.createTrip(trip);
                sendJsonResponse(exchange, 201, JsonUtil.toJson(created));
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
        }
    }

    static class AwardBidHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, Object> map = JsonUtil.parseJsonObject(body);

            String tripId = JsonUtil.getString(map, "tripId", "");
            String bidId = JsonUtil.getString(map, "bidId", "");

            boolean ok = tripService.awardBid(tripId, bidId);
            Map<String, Object> res = new HashMap<>();
            res.put("success", ok);
            if (ok) {
                res.put("trip", tripService.getTripById(tripId));
            }
            sendJsonResponse(exchange, ok ? 200 : 400, JsonUtil.toJson(res));
        }
    }

    static class SubmitBidHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, Object> map = JsonUtil.parseJsonObject(body);

            String tripId = JsonUtil.getString(map, "tripId", "");
            Bid bid = new Bid();
            bid.setTransporterId(JsonUtil.getString(map, "transporterId", "MH-TRN-2088"));
            bid.setTransporterName(JsonUtil.getString(map, "transporterName", "Transporter Carrier"));
            bid.setVehicleType(JsonUtil.getString(map, "vehicleType", "Heavy Cane Truck (25 MT)"));
            bid.setVehicleRegNo(JsonUtil.getString(map, "vehicleRegNo", "MH-09-CV-4821"));
            bid.setProposedFareInr(JsonUtil.getDouble(map, "proposedFareInr", 15000.0));
            bid.setRatePerMtInr(JsonUtil.getDouble(map, "ratePerMtInr", 500.0));
            bid.setEtaPickupHrs(JsonUtil.getDouble(map, "etaPickupHrs", 2.0));
            bid.setRating(JsonUtil.getDouble(map, "rating", 4.9));
            bid.setNotes(JsonUtil.getString(map, "notes", "Mechanical Grab Loader equipped"));

            boolean ok = tripService.submitBid(tripId, bid);
            Map<String, Object> res = new HashMap<>();
            res.put("success", ok);
            res.put("bid", bid);
            sendJsonResponse(exchange, ok ? 201 : 400, JsonUtil.toJson(res));
        }
    }

    static class FrpCalculateHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, Object> map = JsonUtil.parseJsonObject(body);

            WeighbridgeBatch input = parseBatchFromMap(map);
            WeighbridgeBatch result = frpService.calculatePricing(input);

            sendJsonResponse(exchange, 200, JsonUtil.toJson(result));
        }
    }

    static class WeighbridgeLogHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, Object> map = JsonUtil.parseJsonObject(body);

            WeighbridgeBatch input = parseBatchFromMap(map);
            WeighbridgeBatch saved = millService.recordWeighbridgeBatch(input);

            sendJsonResponse(exchange, 201, JsonUtil.toJson(saved));
        }
    }

    static class MassBalanceUpsertHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, Object> map = JsonUtil.parseJsonObject(body);

            int year = JsonUtil.getInt(map, "year", 2026);
            double crushed = JsonUtil.getDouble(map, "caneCrushedMt", 1300000.0);
            double sugar = JsonUtil.getDouble(map, "sugarMt", 145000.0);
            double ethanol = JsonUtil.getDouble(map, "ethanolKl", 38000.0);
            double bagasse = JsonUtil.getDouble(map, "bagasseMt", 380000.0);
            double molasses = JsonUtil.getDouble(map, "molassesMt", 55000.0);

            MassBalanceRecord record = new MassBalanceRecord(year, crushed, sugar, ethanol, bagasse, molasses);
            millService.upsertMassBalanceRecord(record);

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("record", record);
            res.put("ledger", millService.getMassBalanceLedger());
            sendJsonResponse(exchange, 200, JsonUtil.toJson(res));
        }
    }

    static class MassBalanceDeleteHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, Object> map = JsonUtil.parseJsonObject(body);

            int year = JsonUtil.getInt(map, "year", 0);
            boolean ok = millService.deleteMassBalanceRecord(year);

            Map<String, Object> res = new HashMap<>();
            res.put("success", ok);
            res.put("ledger", millService.getMassBalanceLedger());
            sendJsonResponse(exchange, 200, JsonUtil.toJson(res));
        }
    }

    static class RouteCalculateHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, Object> map = JsonUtil.parseJsonObject(body);

            double lat1 = JsonUtil.getDouble(map, "lat1", 16.6912);
            double lon1 = JsonUtil.getDouble(map, "lon1", 74.2448);
            double lat2 = JsonUtil.getDouble(map, "lat2", 16.7325);
            double lon2 = JsonUtil.getDouble(map, "lon2", 74.6042);

            RouteMetrics metrics = routeService.calculateMetrics(lat1, lon1, lat2, lon2);
            sendJsonResponse(exchange, 200, JsonUtil.toJson(metrics));
        }
    }

    static class ClimateHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("ensoRecords", climateService.getEnsoRecords());
            res.put("rainfallRecords", climateService.getRainfallRecords());
            res.put("mills", climateService.getSugarMills());
            sendJsonResponse(exchange, 200, JsonUtil.toJson(res));
        }
    }

    static class ResetHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            dataStore.initSeedData();
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            sendJsonResponse(exchange, 200, JsonUtil.toJson(res));
        }
    }

    // ========================================================================
    // STATIC FILE HANDLER
    // ========================================================================

    static class StaticFileHandler implements HttpHandler {
        private final List<Path> searchRoots = Arrays.asList(
            Paths.get("."),
            Paths.get("src/main/resources/static"),
            Paths.get("..")
        );

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            Path resolvedFile = null;
            for (Path root : searchRoots) {
                Path candidate = root.resolve(path.startsWith("/") ? path.substring(1) : path).normalize();
                if (Files.exists(candidate) && !Files.isDirectory(candidate)) {
                    resolvedFile = candidate;
                    break;
                }
            }

            if (resolvedFile == null) {
                String notFound = "<h1>404 Not Found</h1><p>Path: " + path + "</p>";
                exchange.sendResponseHeaders(404, notFound.length());
                OutputStream os = exchange.getResponseBody();
                os.write(notFound.getBytes(StandardCharsets.UTF_8));
                os.close();
                return;
            }

            String mime = getMimeType(resolvedFile.getFileName().toString());
            exchange.getResponseHeaders().set("Content-Type", mime);
            addCorsHeaders(exchange);

            byte[] bytes = Files.readAllBytes(resolvedFile);
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }

        private String getMimeType(String filename) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=utf-8";
            if (lower.endsWith(".css")) return "text/css; charset=utf-8";
            if (lower.endsWith(".js")) return "application/javascript; charset=utf-8";
            if (lower.endsWith(".json")) return "application/json; charset=utf-8";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".sql")) return "text/plain; charset=utf-8";
            if (lower.endsWith(".md")) return "text/markdown; charset=utf-8";
            return "application/octet-stream";
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private static WeighbridgeBatch parseBatchFromMap(Map<String, Object> map) {
        WeighbridgeBatch b = new WeighbridgeBatch();
        b.setTripId(JsonUtil.getString(map, "tripId", "TRIP-MH-901"));
        b.setFarmerName(JsonUtil.getString(map, "farmerName", "Rajendra Dattatray Patil"));
        b.setCaneVariety(JsonUtil.getString(map, "caneVariety", "Co 86032"));
        b.setGrossWeightMt(JsonUtil.getDouble(map, "grossWeightMt", 57.5));
        b.setTareWeightMt(JsonUtil.getDouble(map, "tareWeightMt", 9.5));
        b.setTrashDeductionPct(JsonUtil.getDouble(map, "trashDeductionPct", 2.5));
        b.setPolPct(JsonUtil.getDouble(map, "polPct", 13.8));
        b.setBrixPct(JsonUtil.getDouble(map, "brixPct", 20.2));
        b.setReducingSugarsPct(JsonUtil.getDouble(map, "reducingSugarsPct", 0.42));
        b.setDextranPpm(JsonUtil.getDouble(map, "dextranPpm", 160.0));
        b.setBaseFrpPerMt(JsonUtil.getDouble(map, "baseFrpPerMt", 3400.0));
        return b;
    }
}
