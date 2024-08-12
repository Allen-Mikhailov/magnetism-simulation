@echo off

wasm-pack build --release --target web

echo Make sure to specify a directory

del %~dp0\pkg\.gitignore

xcopy %~dp0\pkg %~dp0\public\pkg /E /H /C /R /Q /Y

