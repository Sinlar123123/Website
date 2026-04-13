-- Новые скрытые взамен «гриндовых» по отдельным slug быта / аватару (старые id в БД не удаляем).
insert into public.achievements (id, name, description, coins_reward, xp_reward, is_hidden) values
  ('hidden_jackpot_balance', 'Джекпот быта', 'Иногда копилка выстраивается в такую комбинацию, что хочется прищуриться и проверить, не сон ли это.', 150, 140, true),
  ('hidden_wallet_after_shopping', 'Кошелёк в осадке', 'Вы отдали витрине столько, что даже ачивка сочувствует вашему кошельку.', 155, 145, true),
  ('hidden_trophy_glutton', 'Шкаф с медалями трещит', 'Медалей столько, что стена шепчет: «ещё чуть-чуть — и нужен второй ящик».', 160, 150, true),
  ('hidden_chronicle_thick', 'Толстая хроника', 'Ваша история в игре уже не листок — целая тетрадь событий.', 145, 135, true),
  ('hidden_almost_broke', 'Дожили до копейки', 'Баланс настолько скромный, что даже монетка чувствует себя звездой.', 120, 110, true),
  ('hidden_scroll_name', 'Имя как свиток', 'Ник настолько развёрнутый, что его почти не уместить в одну строку без уважения.', 130, 120, true),
  ('hidden_three_day_chain', 'Три дня без передышки', 'Три дня подряд: и бонус, и быт. Вы не отпускаете ритм.', 165, 155, true),
  ('hidden_friday_thirteen', 'Чёрная метка календаря', 'Однажды вы играли в пятницу тринадцатого. Судьба подмигнула.', 140, 130, true),
  ('hidden_leet_balance', 'Подмигивание машине', 'Счётчики выстроились в узнаваемый шёпот для тех, кто в теме.', 135, 125, true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  coins_reward = excluded.coins_reward,
  xp_reward = excluded.xp_reward,
  is_hidden = excluded.is_hidden;
