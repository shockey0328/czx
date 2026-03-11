@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在用「无历史新分支」方式清除超过 100MB 的文件并推送到 GitHub...
echo.

echo [1/6] 创建无历史新分支 temp-main...
git checkout --orphan temp-main
if errorlevel 1 ( echo 失败. & pause & exit /b 1 )

echo [2/6] 添加当前文件（.gitignore 已排除 data\*.json、*.xlsx、*.csv）...
git add -A

echo [3/6] 提交...
git commit -m "chore: 单次提交（已从历史中移除大文件，数据改由 Release 提供）"
if errorlevel 1 ( echo 提交失败或没有变更. & pause & exit /b 1 )

echo [4/6] 删除原 main 并改名为 main...
git branch -D main
git branch -m main

echo [5/6] 强制推送到 GitHub（将覆盖远程 main 历史）...
git push -f origin main
if errorlevel 1 (
    echo.
    echo 推送失败，可能是网络问题。请检查网络或代理后重试: git push -f origin main
    pause
    exit /b 1
)

echo.
echo 完成。远程 main 已无大文件，可正常推送后续提交。
pause
