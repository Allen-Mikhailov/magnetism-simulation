@echo off

start cmd /k sass --watch public/scss:public/css

start cmd /k http-server -c-1 -p8080

start cmd /k code .

start http://localhost:8080

exit