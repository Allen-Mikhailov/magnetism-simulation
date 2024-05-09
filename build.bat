@echo off

wasm-pack build --release --target web

echo Make sure to specify a directory

xcopy %~dp0\pkg %~dp0\public\pkg /E /H /C /R /Q /Y

