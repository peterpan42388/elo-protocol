# Commit Report Template

Version: v0.1

每次提交应附带一个与 commit 号同名的 markdown 文件，例如：

`16c37d6.md`

推荐模板如下：

```md
# Commit Report: <commit-sha>

## Summary
- What changed
- Why it changed

## Scope
- Files touched
- Modules affected

## Rule Check
- Rule.md: pass / notes
- Spirit.md: pass / notes
- Target.md: pass / notes
- Legality.md: pass / notes
- Rejection.md: pass / notes

## Validation
- Commands executed
- Results

## Risks
- Known risks
- Follow-up risks

## Rollback
- How to revert safely

## Execution Owner
- Human proposer:
- User-owned Agent:
- Maintainer involvement:
```

要求：
1. 报告必须与 commit 可追溯绑定。
2. 报告必须真实反映测试与风险。
3. 没有该报告时，默认不应合并。
