package com.mahacane.util;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.*;

/**
 * Lightweight, zero-dependency JSON serialization and parsing utility.
 * Allows the Java project to execute out-of-the-box on standard OpenJDK without external JARs.
 */
public class JsonUtil {

    /**
     * Serializes any Java object, Map, List, or primitive into a standard JSON string.
     */
    public static String toJson(Object obj) {
        if (obj == null) return "null";

        if (obj instanceof String) {
            return "\"" + escape((String) obj) + "\"";
        }
        if (obj instanceof Number || obj instanceof Boolean) {
            return obj.toString();
        }
        if (obj instanceof Map<?, ?>) {
            Map<?, ?> map = (Map<?, ?>) obj;
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (!first) sb.append(",");
                sb.append("\"").append(escape(String.valueOf(entry.getKey()))).append("\":");
                sb.append(toJson(entry.getValue()));
                first = false;
            }
            sb.append("}");
            return sb.toString();
        }
        if (obj instanceof Iterable<?>) {
            Iterable<?> iter = (Iterable<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (Object item : iter) {
                if (!first) sb.append(",");
                sb.append(toJson(item));
                first = false;
            }
            sb.append("]");
            return sb.toString();
        }

        // POJO Reflection
        StringBuilder sb = new StringBuilder("{");
        Field[] fields = obj.getClass().getDeclaredFields();
        boolean first = true;
        for (Field f : fields) {
            if (Modifier.isStatic(f.getModifiers()) || Modifier.isTransient(f.getModifiers())) {
                continue;
            }
            f.setAccessible(true);
            try {
                Object val = f.get(obj);
                if (val != null) {
                    if (!first) sb.append(",");
                    sb.append("\"").append(f.getName()).append("\":");
                    sb.append(toJson(val));
                    first = false;
                }
            } catch (Exception ignored) {}
        }
        sb.append("}");
        return sb.toString();
    }

    /**
     * Parses a simple flat/shallow JSON object string into a Map<String, Object>.
     */
    public static Map<String, Object> parseJsonObject(String json) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (json == null) return map;
        String trimmed = json.trim();
        if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return map;

        String inner = trimmed.substring(1, trimmed.length() - 1).trim();
        if (inner.isEmpty()) return map;

        int depth = 0;
        boolean inQuotes = false;
        StringBuilder currentPair = new StringBuilder();

        for (int i = 0; i < inner.length(); i++) {
            char c = inner.charAt(i);
            if (c == '\"' && (i == 0 || inner.charAt(i - 1) != '\\')) {
                inQuotes = !inQuotes;
            }
            if (!inQuotes) {
                if (c == '{' || c == '[') depth++;
                else if (c == '}' || c == ']') depth--;
            }

            if (c == ',' && !inQuotes && depth == 0) {
                parseField(currentPair.toString(), map);
                currentPair.setLength(0);
            } else {
                currentPair.append(c);
            }
        }
        if (currentPair.length() > 0) {
            parseField(currentPair.toString(), map);
        }

        return map;
    }

    private static void parseField(String fieldStr, Map<String, Object> targetMap) {
        int colonIdx = fieldStr.indexOf(':');
        if (colonIdx == -1) return;

        String rawKey = fieldStr.substring(0, colonIdx).trim();
        String rawVal = fieldStr.substring(colonIdx + 1).trim();

        String key = rawKey.replaceAll("^\"|\"$", "");
        Object val = parseValue(rawVal);
        targetMap.put(key, val);
    }

    public static Object parseValue(String raw) {
        if (raw == null || raw.isEmpty() || raw.equals("null")) return null;
        if (raw.startsWith("\"") && raw.endsWith("\"") && raw.length() >= 2) {
            return unescape(raw.substring(1, raw.length() - 1));
        }
        if (raw.equalsIgnoreCase("true")) return Boolean.TRUE;
        if (raw.equalsIgnoreCase("false")) return Boolean.FALSE;

        try {
            if (raw.contains(".")) {
                return Double.parseDouble(raw);
            } else {
                return Long.parseLong(raw);
            }
        } catch (NumberFormatException ignored) {
            return raw;
        }
    }

    public static String getString(Map<String, Object> map, String key, String defaultVal) {
        Object val = map.get(key);
        return val != null ? String.valueOf(val) : defaultVal;
    }

    public static Double getDouble(Map<String, Object> map, String key, Double defaultVal) {
        Object val = map.get(key);
        if (val instanceof Number) return ((Number) val).doubleValue();
        if (val != null) {
            try { return Double.parseDouble(val.toString()); } catch (Exception ignored) {}
        }
        return defaultVal;
    }

    public static Integer getInt(Map<String, Object> map, String key, Integer defaultVal) {
        Object val = map.get(key);
        if (val instanceof Number) return ((Number) val).intValue();
        if (val != null) {
            try { return Integer.parseInt(val.toString()); } catch (Exception ignored) {}
        }
        return defaultVal;
    }

    private static String escape(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static String unescape(String s) {
        return s.replace("\\\"", "\"")
                .replace("\\\\", "\\")
                .replace("\\n", "\n")
                .replace("\\r", "\r")
                .replace("\\t", "\t");
    }
}
