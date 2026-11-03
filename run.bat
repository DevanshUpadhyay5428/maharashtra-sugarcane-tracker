@echo off
setlocal
title Maharashtra Sugarcane Supply Chain Tracker (Java Backend)

echo ============================================================================
echo   Starting Maharashtra Sugarcane Supply Chain Tracker (Java Engine)...
echo ============================================================================

REM Check if java is installed
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not found on your system PATH.
    echo Please ensure Java 17, 21, or 25 is installed.
    pause
    exit /b 1
)

echo [1/3] Checking Java runtime environment...
java -version

echo [2/3] Compiling Java source files...
if not exist "bin" mkdir bin
javac -encoding UTF-8 -d bin src\main\java\com\mahacane\*.java src\main\java\com\mahacane\model\*.java src\main\java\com\mahacane\service\*.java src\main\java\com\mahacane\repository\*.java src\main\java\com\mahacane\util\*.java

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed.
    pause
    exit /b 1
)

echo [3/3] Launching Java Embedded HTTP Server & REST API on port 8080...
echo.
java -cp bin com.mahacane.Main 8080

pause
