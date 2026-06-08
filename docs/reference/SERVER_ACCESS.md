# 服务器访问参考

## SSH

```bash
ssh aliyun
```

## Docker

只有一个容器，名为 `dnf`：

```bash
docker ps
# dnf   registry.cn-hangzhou.aliyuncs.com/1995chen/dnf:centos7-2.1.9.fix1
```

## MySQL

**连接方式：**

```bash
docker exec dnf mysql -u game -puu5\!^%jg -h 127.0.0.1
```

- 用户：`game`
- 密码：`uu5!^%jg`
- 来源：`/data/Config.ini` 中 `[DBServer]` 段

**常见错误：**
- `--socket=/var/lib/mysql/mysql.sock` 会被拒，必须用 TCP `-h 127.0.0.1`
- 密码中的 `!` 在 bash 中需要转义：`\!`

## GM 相关数据库表

| 数据库 | 表 | 说明 |
|---|---|---|
| `taiwan_login` | `gm_manifest` | GM 清单，`m_id`=账号ID，`level`=权限等级(7=最高) |
| `d_taiwan` | `member_info` | 用户信息，`m_type`=账号类型 |
| `d_taiwan` | `member_white_account` | 白名单账号 |
| `d_taiwan` | `accounts` | 账号表，`UID` 和 `accountname` |

**添加 GM：**

```sql
INSERT INTO taiwan_login.gm_manifest (m_id, level) VALUES (<账号ID>, 7);
```

**查看当前 GM：**

```bash
docker exec dnf mysql -u game -puu5\!^%jg -h 127.0.0.1 -e "SELECT * FROM taiwan_login.gm_manifest;"
```
