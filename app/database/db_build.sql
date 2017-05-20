BEGIN;

DROP TABLE IF EXISTS nuggets;

CREATE TABLE nuggets(
  id SERIAL PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  long DOUBLE PRECISION NOT NULL,
  category VARCHAR(30) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  img_url VARCHAR(300),
  author VARCHAR(100) NOT NULL,
  created timestamp default current_timestamp
);

INSERT INTO nuggets
(lat, long, category, title, description, author)
VALUES
(32.699, 35.303, 'food', 'Test title', 'Test description', 'Test author'),
(32.709, 35.313, 'fun-fact', 'Test title', 'Test description', 'Test author'),
(32.719, 35.303, 'history', 'Test title', 'Test description', 'Test author'),
(32.729, 35.293, 'information', 'Test title', 'Test description', 'Test author'),
(32.689, 35.323, 'nature', 'Test title', 'Test description', 'Test author'),
(32.695, 35.313, 'viewpoint', 'Test title', 'Test description', 'Test author');

COMMIT;
