BEGIN;
INSERT INTO "User" (id, name, email, "passwordHash", "updatedAt")
VALUES (
        '__conn_test__',
        'check',
        '__conn_test@local',
        'x',
        now()
    );
INSERT INTO "Transaction" (id, "userId", amount, "updatedAt")
VALUES ('__conn_test_tx__', '__conn_test__', 1.5, now());
SELECT count(*) AS users_visible_in_tx
FROM "User";
ROLLBACK;
SELECT count(*) AS users_after_rollback
FROM "User";