create table currencies
(
    id       int auto_increment
        primary key,
    currency varchar(3) not null
);

create table languages
(
    language varchar(2) not null
        primary key
);

create table roles
(
    id       int auto_increment
        primary key,
    role     varchar(40)   not null,
    price_id varchar(4000) null
);

create table telements
(
    id   int auto_increment
        primary key,
    type varchar(15) not null
);

create table timeframes
(
    id        int auto_increment
        primary key,
    timeframe varchar(10) not null
);

create table users
(
    id                   int auto_increment
        primary key,
    username             varchar(40)                          not null,
    email                varchar(40)                          not null,
    name                 varchar(40)                          not null,
    surname              varchar(40)                          not null,
    language             varchar(2) default 'en'              not null,
    role_id              int                                  not null,
    password             varchar(4000)                        not null,
    created_at           timestamp  default CURRENT_TIMESTAMP not null,
    currency_id          int                                  not null,
    balance              decimal(10, 4)                       not null,
    showProfits          tinyint(1) default 0                 not null,
    darkMode             tinyint(1) default 0                 not null,
    resetPasswordToken   varchar(4000)                        null,
    resetPasswordExpire  datetime                             null,
    stripeCustomerId     varchar(500)                         null,
    stripeSubscriptionId varchar(500)                         null,
    stripeProductId      varchar(500)                         null,
    has_crypto           tinyint(1) default 0                 not null,
    has_forex            tinyint(1) default 0                 not null,
    constraint users_ibfk_1
        foreign key (language) references languages (language),
    constraint users_ibfk_2
        foreign key (role_id) references roles (id),
    constraint users_ibfk_3
        foreign key (currency_id) references currencies (id)
);

create table comments
(
    id          int auto_increment
        primary key,
    user_id     int                                 not null,
    created_at  timestamp default CURRENT_TIMESTAMP not null,
    comment     varchar(4000)                       null,
    last_update timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint comments_ibfk_1
        foreign key (user_id) references users (id)
);

create index user_id
    on comments (user_id);

create table goals
(
    id      int auto_increment
        primary key,
    goal    varchar(100) not null,
    user_id int          not null,
    constraint goals_ibfk_1
        foreign key (user_id) references users (id)
);

create index user_id
    on goals (user_id);

create table pairs
(
    id        int auto_increment
        primary key,
    pair      varchar(11)                                                  not null,
    category  enum ('Forex', 'Crypto', 'Stock', 'Futures', 'CDF', 'Index') not null,
    has_rate  tinyint(1) default 0                                         not null,
    user_id   int                                                          not null,
    is_custom tinyint(1) default 1                                         null,
    constraint pairs
        unique (pair, user_id),
    constraint pairs_ibfk_1
        foreign key (user_id) references users (id)
);

create index user_id
    on pairs (user_id);

create table plans
(
    id           int auto_increment
        primary key,
    user_id      int                                  not null,
    title        varchar(100)                         null,
    created_at   timestamp  default CURRENT_TIMESTAMP not null,
    broker       varchar(100)                         null,
    charts       varchar(100)                         null,
    capital      varchar(100)                         null,
    routine      varchar(1000)                        null,
    psy_notes    varchar(1000)                        null,
    psy_tips     tinyint(1) default 0                 not null,
    jrn_process  varchar(1000)                        null,
    str_revision varchar(1000)                        null,
    jrn_revision varchar(1000)                        null,
    pln_revision varchar(1000)                        null,
    constraint plans_ibfk_1
        foreign key (user_id) references users (id)
);

create table checklists
(
    id        int auto_increment
        primary key,
    plan_id   int          not null,
    checklist varchar(100) null,
    constraint checklists_ibfk_1
        foreign key (plan_id) references plans (id)
);

create index plan_id
    on checklists (plan_id);

create table objectives
(
    id        int auto_increment
        primary key,
    plan_id   int                    not null,
    type      enum ('fin', 'nonfin') null,
    objective varchar(100)           null,
    constraint objectives_ibfk_1
        foreign key (plan_id) references plans (id)
);

create index plan_id
    on objectives (plan_id);

create index user_id
    on plans (user_id);

create table strategies
(
    id       int auto_increment
        primary key,
    strategy varchar(50) null,
    user_id  int         not null,
    constraint strategy
        unique (strategy, user_id),
    constraint strategies_ibfk_1
        foreign key (user_id) references users (id)
);

create table backtest
(
    id           int auto_increment
        primary key,
    user_id      int                                 not null,
    created_at   timestamp default CURRENT_TIMESTAMP not null,
    pair_id      int                                 null,
    direction    enum ('long', 'short')              null,
    result       enum ('%', 'R')                     not null,
    strategy_id  int                                 null,
    timeframe_id int                                 null,
    constraint backtest_ibfk_1
        foreign key (user_id) references users (id),
    constraint backtest_ibfk_2
        foreign key (pair_id) references pairs (id),
    constraint backtest_ibfk_3
        foreign key (strategy_id) references strategies (id),
    constraint backtest_ibfk_4
        foreign key (timeframe_id) references timeframes (id)
);

create index pair_id
    on backtest (pair_id);

create index strategy_id
    on backtest (strategy_id);

create index timeframe_id
    on backtest (timeframe_id);

create index user_id
    on backtest (user_id);

create table backtest_addons
(
    id          int auto_increment
        primary key,
    backtest_id int                  not null,
    which_addon int                  not null,
    description varchar(1000)        not null,
    is_integers tinyint(1) default 0 not null,
    option1     varchar(1000)        null,
    option2     varchar(1000)        null,
    option3     varchar(1000)        null,
    option4     varchar(1000)        null,
    option5     varchar(1000)        null,
    option6     varchar(1000)        null,
    constraint uc_backtest_addon
        unique (backtest_id, which_addon),
    constraint backtest_addons_ibfk_1
        foreign key (backtest_id) references backtest (id)
);

create table backtest_data
(
    id           int auto_increment
        primary key,
    identifier   int                    not null,
    backtest_id  int                    not null,
    direction    enum ('long', 'short') null,
    result       float                  not null,
    pair_id      int                    null,
    strategy_id  int                    null,
    timeframe_id int                    null,
    addon1       varchar(45)            null,
    addon2       varchar(45)            null,
    addon3       varchar(45)            null,
    addon4       varchar(45)            null,
    addon5       varchar(45)            null,
    addon6       varchar(45)            null,
    constraint backtest_data_ibfk_1
        foreign key (backtest_id) references backtest (id),
    constraint backtest_data_ibfk_2
        foreign key (pair_id) references pairs (id),
    constraint backtest_data_ibfk_3
        foreign key (strategy_id) references strategies (id),
    constraint backtest_data_ibfk_4
        foreign key (timeframe_id) references timeframes (id)
);

create index backtest_id
    on backtest_data (backtest_id);

create index pair_id
    on backtest_data (pair_id);

create index strategy_id
    on backtest_data (strategy_id);

create index timeframe_id
    on backtest_data (timeframe_id);

create table pln_positions
(
    id          int auto_increment
        primary key,
    plan_id     int                                   not null,
    strategy_id int                                   not null,
    title       varchar(100)                          null,
    rule_type   enum ('tp-f', 'tp-p', 'sl-f', 'sl-p') null,
    amount      decimal(5, 2)                         null,
    order_type  enum ('market', 'limit')              null,
    description varchar(1000)                         null,
    constraint pln_positions_ibfk_1
        foreign key (plan_id) references plans (id),
    constraint pln_positions_ibfk_2
        foreign key (strategy_id) references strategies (id)
);

create index plan_id
    on pln_positions (plan_id);

create index strategy_id
    on pln_positions (strategy_id);

create table pln_strategies
(
    id           int auto_increment
        primary key,
    plan_id      int           not null,
    strategy_id  int           not null,
    about        varchar(1000) null,
    howto        varchar(1000) null,
    keynotes     varchar(1000) null,
    timeframe_id int           null,
    pair_id      int           null,
    risk         decimal(4, 2) null,
    backtest_id  int           null,
    constraint pln_strategies_ibfk_1
        foreign key (plan_id) references plans (id),
    constraint pln_strategies_ibfk_2
        foreign key (strategy_id) references strategies (id),
    constraint pln_strategies_ibfk_3
        foreign key (timeframe_id) references timeframes (id),
    constraint pln_strategies_ibfk_4
        foreign key (pair_id) references pairs (id),
    constraint pln_strategies_ibfk_5
        foreign key (backtest_id) references backtest (id)
);

create index backtest_id
    on pln_strategies (backtest_id);

create index pair_id
    on pln_strategies (pair_id);

create index plan_id
    on pln_strategies (plan_id);

create index strategy_id
    on pln_strategies (strategy_id);

create index timeframe_id
    on pln_strategies (timeframe_id);

create index user_id
    on strategies (user_id);

create table strategies_docs
(
    id          int auto_increment
        primary key,
    user_id     int                                 not null,
    description varchar(1000)                       null,
    strategy_id int                                 null,
    last_update timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint strategies_docs_ibfk_1
        foreign key (user_id) references users (id),
    constraint strategies_docs_ibfk_2
        foreign key (strategy_id) references strategies (id)
);

create index strategy_id
    on strategies_docs (strategy_id);

create index user_id
    on strategies_docs (user_id);

create table strategies_exits
(
    id          int auto_increment
        primary key,
    user_id     int                                                                                      not null,
    strategy_id int                                                                                      not null,
    type        enum ('Loss', 'Profit', 'Add', 'Reduce')                                                 not null,
    order_type  enum ('Market order', 'Limit order', 'Stop order', 'Stop-Limit order', 'Trailing order') not null,
    description varchar(1000)                                                                            null,
    name        varchar(100)                                                                             null,
    constraint strategies_exits_ibfk_1
        foreign key (user_id) references users (id),
    constraint strategies_exits_ibfk_2
        foreign key (strategy_id) references strategies (id)
);

create index strategy_id
    on strategies_exits (strategy_id);

create index user_id
    on strategies_exits (user_id);

create table strategies_observations
(
    id          int auto_increment
        primary key,
    user_id     int           not null,
    strategy_id int           not null,
    observation varchar(1000) null,
    constraint strategies_observations_ibfk_1
        foreign key (user_id) references users (id),
    constraint strategies_observations_ibfk_2
        foreign key (strategy_id) references strategies (id)
);

create index strategy_id
    on strategies_observations (strategy_id);

create index user_id
    on strategies_observations (user_id);

create table strategies_rules
(
    id          int auto_increment
        primary key,
    user_id     int           not null,
    strategy_id int           not null,
    rule        varchar(1000) null,
    position    int           not null,
    constraint strategies_rules_ibfk_1
        foreign key (user_id) references users (id),
    constraint strategies_rules_ibfk_2
        foreign key (strategy_id) references strategies (id)
);

create index strategy_id
    on strategies_rules (strategy_id);

create index user_id
    on strategies_rules (user_id);

create table stripe_users
(
    user_id                       int          not null,
    stripeCustomerPaymentMethodId varchar(500) not null
        primary key,
    expiration                    date         null,
    last4                         varchar(4)   null,
    figerprint                    varchar(500) null,
    billingDetails                varchar(500) null,
    constraint stripe_users_ibfk_1
        foreign key (user_id) references users (id)
);

create index user_id
    on stripe_users (user_id);

create table tanalysis
(
    id          int auto_increment
        primary key,
    category    varchar(20)                         not null,
    pair_id     int                                 not null,
    created_at  date                                not null,
    user_id     int                                 not null,
    last_update timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint tanalysis_ibfk_1
        foreign key (pair_id) references pairs (id),
    constraint tanalysis_ibfk_2
        foreign key (user_id) references users (id)
);

create table entries
(
    id           int auto_increment
        primary key,
    user_id      int                                  not null,
    pair_id      int                                  not null,
    category     varchar(20)                          not null,
    size         double                               not null,
    strategy_id  int                                  not null,
    timeframe_id int                                  not null,
    entry_dt     timestamp  default CURRENT_TIMESTAMP not null,
    exit_dt      timestamp                            null,
    direction    enum ('long', 'short')               not null,
    entry_price  double                               not null,
    stop_loss    double                               null,
    take_profit  double                               null,
    exit_price   double                               null,
    profits      decimal(10, 4)                       null,
    fees         decimal(8, 4)                        null,
    ta_id        int                                  null,
    status       tinyint(1) default 0                 not null,
    comment      varchar(4000)                        null,
    result       enum ('win', 'loss', 'be')           null,
    constraint entries_ibfk_1
        foreign key (user_id) references users (id),
    constraint entries_ibfk_2
        foreign key (pair_id) references pairs (id),
    constraint entries_ibfk_3
        foreign key (strategy_id) references strategies (id),
    constraint entries_ibfk_4
        foreign key (ta_id) references tanalysis (id)
);

create index idx_user_entry_status
    on entries (user_id, status);

create index pair_id
    on entries (pair_id);

create index strategy_id
    on entries (strategy_id);

create index ta_id
    on entries (ta_id);

create index pair_id
    on tanalysis (pair_id);

create index user_id
    on tanalysis (user_id);

create table telementanalysis
(
    id           int auto_increment
        primary key,
    ta_id        int           not null,
    order_at     int           not null,
    element_id   int           not null,
    content      varchar(4000) null,
    file         blob          null,
    strategy_id  int           null,
    timeframe_id int           null,
    constraint telementanalysis_ibfk_1
        foreign key (ta_id) references tanalysis (id),
    constraint telementanalysis_ibfk_2
        foreign key (element_id) references telements (id),
    constraint telementanalysis_ibfk_3
        foreign key (strategy_id) references strategies (id),
    constraint telementanalysis_ibfk_4
        foreign key (timeframe_id) references timeframes (id)
);

create index element_id
    on telementanalysis (element_id);

create index strategy_id
    on telementanalysis (strategy_id);

create index ta_id
    on telementanalysis (ta_id);

create index timeframe_id
    on telementanalysis (timeframe_id);

create index currency_id
    on users (currency_id);

create index language
    on users (language);

create index role_id
    on users (role_id);

create or replace view users_deserialize as
select `users`.`id`                   AS `id`,
       `users`.`username`             AS `username`,
       `users`.`email`                AS `email`,
       `users`.`name`                 AS `name`,
       `users`.`surname`              AS `surname`,
       `users`.`language`             AS `language`,
       `users`.`role_id`              AS `role_id`,
       `users`.`created_at`           AS `created_at`,
       `users`.`currency_id`          AS `currency_id`,
       `users`.`balance`              AS `balance`,
       `users`.`showProfits`          AS `showProfits`,
       `users`.`darkMode`             AS `darkMode`,
       `users`.`stripeCustomerId`     AS `stripeCustomerId`,
       `users`.`stripeSubscriptionId` AS `stripeSubscriptionId`,
       `users`.`stripeProductId`      AS `stripeProductId`,
       `users`.`has_forex`            AS `has_forex`,
       `users`.`has_crypto`           AS `has_crypto`
from `users`;
