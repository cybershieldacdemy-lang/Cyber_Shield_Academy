import Database from 'better-sqlite3';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const dbPath = path.join(process.cwd(), 'prisma', 'data', 'cyber.db');
const db = new Database(dbPath);

// ═══════════════════════════════════════════════════════════
// ⚡ PRAGMA OPTIMIZATIONS — تحسينات أداء SQLite
// ═══════════════════════════════════════════════════════════
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');      // أسرع من FULL مع أمان كافٍ في وضع WAL
db.pragma('cache_size = -64000');        // 64MB cache (القيمة السالبة = كيلوبايت)
db.pragma('temp_store = MEMORY');        // الجداول المؤقتة في الذاكرة
db.pragma('mmap_size = 268435456');      // 256MB memory-mapped I/O
db.pragma('page_size = 4096');           // حجم الصفحة الأمثل

// Create all tables at initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    avatar TEXT,
    phone TEXT DEFAULT '',
    country TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    experience_level TEXT DEFAULT 'beginner',
    security_question TEXT DEFAULT '',
    security_answer TEXT DEFAULT '',
    email_verified INTEGER DEFAULT 0,
    verification_code TEXT DEFAULT '',
    account_type TEXT DEFAULT 'student',
    points INTEGER DEFAULT 0,
    google_refresh_token TEXT,
    google_email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    icon TEXT NOT NULL,
    points_required INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    badge_id TEXT NOT NULL,
    awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
  );

  CREATE TABLE IF NOT EXISTS terms (
    id INTEGER PRIMARY KEY,
    term_en TEXT NOT NULL,
    term_ar TEXT NOT NULL,
    definition_ar TEXT NOT NULL,
    definition_en TEXT NOT NULL,
    example TEXT NOT NULL,
    level TEXT NOT NULL,
    category_id INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    level TEXT NOT NULL DEFAULT 'beginner',
    category TEXT DEFAULT 'general',
    lessons INTEGER DEFAULT 0,
    duration TEXT DEFAULT '',
    image TEXT DEFAULT '',
    instructor TEXT DEFAULT '',
    price REAL DEFAULT 0,
    video_url TEXT DEFAULT '',
    published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS course_lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    video_type TEXT DEFAULT 'local',
    duration TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_free INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(course_id, video_url)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_ar TEXT,
    content_en TEXT,
    excerpt_ar TEXT,
    category TEXT DEFAULT 'awareness',
    tags TEXT DEFAULT '',
    image TEXT DEFAULT '',
    author TEXT DEFAULT '',
    published INTEGER DEFAULT 1,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_ar TEXT,
    severity TEXT DEFAULT 'medium',
    cve_id TEXT DEFAULT '',
    affected TEXT DEFAULT '',
    source TEXT DEFAULT '',
    published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    course_id INTEGER,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    course_id INTEGER NOT NULL,
    lesson_id INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    score REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    course_id INTEGER NOT NULL,
    course_title TEXT NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    certificate_code TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user_id TEXT,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    resource TEXT,
    resource_id TEXT,
    details TEXT,
    severity TEXT DEFAULT 'low',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    success INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS firewall_rules (
    id TEXT PRIMARY KEY,
    ip TEXT NOT NULL,
    action TEXT NOT NULL DEFAULT 'BLOCK',
    reason TEXT,
    isActive BOOLEAN DEFAULT 1,
    createdBy TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ip)
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN',
    type TEXT NOT NULL,
    actionsTaken TEXT,
    reportedBy TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    assetType TEXT NOT NULL,
    classification TEXT NOT NULL,
    owner TEXT NOT NULL,
    location TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vulnerabilities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN',
    cve TEXT,
    affectedAssets TEXT,
    remediation TEXT,
    reportedBy TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );


  CREATE TABLE IF NOT EXISTS teacher_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    specialization TEXT NOT NULL,
    experience TEXT NOT NULL,
    cv_link TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    reviewed_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS live_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    teacher_id TEXT NOT NULL,
    student_id TEXT,
    session_type TEXT DEFAULT 'video',
    status TEXT DEFAULT 'scheduled',
    scheduled_at DATETIME,
    started_at DATETIME,
    ended_at DATETIME,
    room_id TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS session_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS course_enrollments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    UNIQUE(user_id, course_id)
  );

  CREATE TABLE IF NOT EXISTS lesson_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lesson_id INTEGER NOT NULL,
    watched_seconds INTEGER DEFAULT 0,
    is_completed INTEGER DEFAULT 0,
    last_watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    lesson_id INTEGER,
    title TEXT NOT NULL,
    passing_score INTEGER DEFAULT 70,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_option_index INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    quiz_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    passed INTEGER NOT NULL,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lesson_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_teacher_reply INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT DEFAULT 'Remote',
      job_type TEXT DEFAULT 'Full-Time',
      role TEXT NOT NULL, 
      description TEXT NOT NULL,
      requirements TEXT,
      apply_link TEXT,
      posted_by TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(job_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS ctf_categories (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '🚩',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ctf_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT DEFAULT 'easy',
      base_points INTEGER DEFAULT 500,
      min_points INTEGER DEFAULT 50,
      decay_solves INTEGER DEFAULT 50,
      points INTEGER DEFAULT 50,
      flag TEXT NOT NULL,
      is_dynamic INTEGER DEFAULT 0,
      author TEXT DEFAULT 'CyberShield',
      status TEXT DEFAULT 'active',
      tags TEXT DEFAULT '[]',
      external_links TEXT DEFAULT '[]',
      hints TEXT,
      file_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES ctf_categories(id)
  );

  CREATE TABLE IF NOT EXISTS ctf_hints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      cost INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ctf_unlocked_hints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      hint_id INTEGER NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, hint_id),
      FOREIGN KEY (hint_id) REFERENCES ctf_hints(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ctf_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT,
      FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ctf_dynamic_flags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      flag TEXT NOT NULL,
      UNIQUE(challenge_id, user_id),
      FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ctf_solves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      solved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      points_earned INTEGER NOT NULL,
      UNIQUE(challenge_id, user_id),
      FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id)
  );


  CREATE TABLE IF NOT EXISTS labs (
      id TEXT PRIMARY KEY,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      description_ar TEXT,
      description_en TEXT,
      difficulty TEXT DEFAULT 'beginner',
      category TEXT DEFAULT 'network',
      xp INTEGER DEFAULT 100,
      duration TEXT DEFAULT '30m',
      tools TEXT, -- JSON array of strings
      is_online INTEGER DEFAULT 1,
      environment_config TEXT, -- JSON configuration for VFS/Network
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lab_scenarios (
      id TEXT PRIMARY KEY,
      lab_id TEXT NOT NULL,
      step_order INTEGER NOT NULL,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      task_description TEXT NOT NULL,
      validation_regex TEXT,
      hint TEXT,
      solution TEXT,
      FOREIGN KEY (lab_id) REFERENCES labs(id)
  );

  CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      description_ar TEXT,
      description_en TEXT,
      icon TEXT,
      points INTEGER DEFAULT 50,
      category TEXT DEFAULT 'general'
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, achievement_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (achievement_id) REFERENCES achievements(id)
  );

  CREATE TABLE IF NOT EXISTS course_lesson_labs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      lab_id TEXT NOT NULL,
      UNIQUE(course_id, lesson_id, lab_id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (lesson_id) REFERENCES course_lessons(id),
      FOREIGN KEY (lab_id) REFERENCES labs(id)
  );

  CREATE TABLE IF NOT EXISTS lab_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lab_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      points_earned INTEGER NOT NULL,
      UNIQUE(lab_id, user_id),
      FOREIGN KEY (lab_id) REFERENCES labs(id)
  );

  CREATE TABLE IF NOT EXISTS learning_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'beginner',
      video_url TEXT NOT NULL,
      thumbnail TEXT DEFAULT '',
      duration TEXT DEFAULT '',
      instructor TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      path_id TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS video_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      video_id INTEGER NOT NULL,
      watched_seconds INTEGER DEFAULT 0,
      is_completed INTEGER DEFAULT 0,
      last_watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, video_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (video_id) REFERENCES learning_videos(id)
  );

  CREATE TABLE IF NOT EXISTS video_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      video_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, video_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (video_id) REFERENCES learning_videos(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT DEFAULT 'system',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      icon TEXT DEFAULT '🔔',
      link TEXT,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      type TEXT DEFAULT 'email',
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- ═══════════════════════════════════════════════════════════
  -- 💳 SUBSCRIPTION & PAYMENT TABLES — جداول الاشتراكات والدفع
  -- ═══════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      price REAL DEFAULT 0,
      stripe_price_id TEXT DEFAULT '',
      features TEXT DEFAULT '[]',
      limits TEXT DEFAULT '{}',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL DEFAULT 'free',
      stripe_subscription_id TEXT DEFAULT '',
      stripe_customer_id TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      current_period_start DATETIME,
      current_period_end DATETIME,
      cancel_at_period_end INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (plan_id) REFERENCES plans(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subscription_id TEXT,
      stripe_payment_intent_id TEXT DEFAULT '',
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'usd',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
  );

  -- ═══════════════════════════════════════════════════════════
  -- 🧠 AI SYSTEM TABLES — جداول نظام الذكاء الاصطناعي
  -- ═══════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      context_type TEXT DEFAULT 'general',
      context_id TEXT,
      title TEXT DEFAULT '',
      messages TEXT NOT NULL DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ai_usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      ip_address TEXT,
      tokens_used INTEGER DEFAULT 0,
      context_type TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- ═══════════════════════════════════════════════════════════
  -- 🔄 REFRESH TOKEN STORAGE — تخزين رموز التحديث
  -- ═══════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- ═══════════════════════════════════════════════════════════
  -- 🛡️ CSRF TOKEN STORAGE — رموز حماية CSRF
  -- ═══════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS csrf_tokens (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- ═══════════════════════════════════════════════════════════
  -- 📊 SYSTEM ACTIVITY LOGS — سجلات نشاط النظام
  -- ═══════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT DEFAULT 'info',
      category TEXT DEFAULT 'system',
      message TEXT NOT NULL,
      metadata TEXT,
      user_id TEXT,
      ip_address TEXT,
      request_path TEXT,
      response_status INTEGER,
      response_time_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- ═══════════════════════════════════════════════════════════
  -- 📜 GDPR COMPLIANCE TABLES — جداول الامتثال لـ GDPR
  -- ═══════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS user_consents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      consent_type TEXT NOT NULL,
      granted INTEGER DEFAULT 0,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS data_deletion_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      processed_by TEXT
  );

  -- ═══════════════════════════════════════════════════════════
  -- 👥 TEAMS & COMMUNITY — الفرق والمجتمع
  -- ═══════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      avatar TEXT,
      captain_id TEXT NOT NULL,
      max_members INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (captain_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      status TEXT DEFAULT 'active',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(team_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, achievement_id)
  );
`);

// ═══════════════════════════════════════════════════════════
// 📇 INDEXES — فهارس لتسريع الاستعلامات المتكررة
// ═══════════════════════════════════════════════════════════
db.exec(`
  -- Audit logs indexes (IDS, audit page, firewall detection)
  CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
  CREATE INDEX IF NOT EXISTS idx_audit_ip ON audit_logs(ip_address);
  CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs(severity);
  CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
  -- Composite index for IDS queries (action + created_at)
  CREATE INDEX IF NOT EXISTS idx_audit_action_created ON audit_logs(action, created_at);

  -- Login attempts indexes (brute-force detection)
  CREATE INDEX IF NOT EXISTS idx_login_email ON login_attempts(email);
  CREATE INDEX IF NOT EXISTS idx_login_ip ON login_attempts(ip_address);
  CREATE INDEX IF NOT EXISTS idx_login_created ON login_attempts(created_at);

  -- Terms indexes
  CREATE INDEX IF NOT EXISTS idx_terms_level ON terms(level);
  CREATE INDEX IF NOT EXISTS idx_terms_category ON terms(category_id);

  -- Courses & posts indexes
  CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
  CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
  CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);

  -- Course lessons indexes
  CREATE INDEX IF NOT EXISTS idx_lessons_course ON course_lessons(course_id);
  CREATE INDEX IF NOT EXISTS idx_lessons_order ON course_lessons(course_id, sort_order);

  -- Comments indexes
  CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
  CREATE INDEX IF NOT EXISTS idx_comments_course ON comments(course_id);

  -- Progress indexes
  CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);

  -- Firewall indexes
  CREATE INDEX IF NOT EXISTS idx_firewall_ip ON firewall_rules(ip);
  CREATE INDEX IF NOT EXISTS idx_firewall_active ON firewall_rules(isActive);

  -- Teacher applications indexes
  CREATE INDEX IF NOT EXISTS idx_teacher_app_status ON teacher_applications(status);
  CREATE INDEX IF NOT EXISTS idx_teacher_app_email ON teacher_applications(email);

  -- Live sessions indexes
  CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON live_sessions(teacher_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_student ON live_sessions(student_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_status ON live_sessions(status);
  CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON live_sessions(scheduled_at);

  -- Session messages indexes
  CREATE INDEX IF NOT EXISTS idx_session_msgs ON session_messages(session_id);

  -- E-Learning tracking indexes
  CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON course_enrollments(user_id);
  CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id);
  CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
  CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course_id);
  CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id);
  CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
  CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson ON lesson_comments(lesson_id);

  -- Labs indexes
  CREATE INDEX IF NOT EXISTS idx_lab_completions_user ON lab_completions(user_id);
  CREATE INDEX IF NOT EXISTS idx_lab_completions_lab ON lab_completions(lab_id);

  -- Learning videos indexes
  CREATE INDEX IF NOT EXISTS idx_videos_category ON learning_videos(category);
  CREATE INDEX IF NOT EXISTS idx_videos_level ON learning_videos(level);
  CREATE INDEX IF NOT EXISTS idx_videos_path ON learning_videos(path_id);
  CREATE INDEX IF NOT EXISTS idx_videos_published ON learning_videos(published);
  CREATE INDEX IF NOT EXISTS idx_videos_views ON learning_videos(views);
  CREATE INDEX IF NOT EXISTS idx_video_progress_user ON video_progress(user_id);
  CREATE INDEX IF NOT EXISTS idx_video_progress_video ON video_progress(video_id);
  CREATE INDEX IF NOT EXISTS idx_video_bookmarks_user ON video_bookmarks(user_id);

  -- Notifications indexes
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
  CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

  -- Certificates indexes (dashboard, certificate verification)
  CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
  CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);
  CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON certificates(user_id, course_id);

  -- Login attempts composite (brute-force detection query)
  CREATE INDEX IF NOT EXISTS idx_login_ip_success_created ON login_attempts(ip_address, success, created_at);

  -- Course enrollments composite (dashboard, enrollment check)
  CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON course_enrollments(user_id, course_id);

  -- CTF solves composite (leaderboard, duplicate check)
  CREATE INDEX IF NOT EXISTS idx_ctf_solves_user ON ctf_solves(user_id);
  CREATE INDEX IF NOT EXISTS idx_ctf_solves_challenge_user ON ctf_solves(challenge_id, user_id);

  -- Jobs indexes
  CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
  CREATE INDEX IF NOT EXISTS idx_jobs_role ON jobs(role);
  CREATE INDEX IF NOT EXISTS idx_job_apps_user ON job_applications(user_id);

  -- User points (leaderboard sort)
  CREATE INDEX IF NOT EXISTS idx_users_points ON users(points);

  -- AI system indexes
  CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON ai_conversations(user_id);
  CREATE INDEX IF NOT EXISTS idx_ai_conv_context ON ai_conversations(context_type, context_id);
  CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_logs(user_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_ai_usage_ip ON ai_usage_logs(ip_address, created_at);

  -- Missing compound indexes for hot paths
  CREATE INDEX IF NOT EXISTS idx_lab_scenarios_lab ON lab_scenarios(lab_id, step_order);
  CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
  CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_lab_completions_composite ON lab_completions(user_id, lab_id);
  CREATE INDEX IF NOT EXISTS idx_progress_user_course ON progress(user_id, course_id);
  CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
  CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);

  -- Subscription & Payment indexes
  CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
  CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
  CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);
  CREATE INDEX IF NOT EXISTS idx_payments_stripe ON payments(stripe_payment_intent_id);

  -- Refresh tokens indexes
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

  -- CSRF tokens indexes
  CREATE INDEX IF NOT EXISTS idx_csrf_session ON csrf_tokens(session_id);
  CREATE INDEX IF NOT EXISTS idx_csrf_token ON csrf_tokens(token);

  -- System logs indexes
  CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
  CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
  CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_system_logs_user ON system_logs(user_id);
`);

// ═══════════════════════════════════════════════════════════
// 🔄 CACHED PREPARED STATEMENTS — استعلامات مُخزَّنة مُسبقاً
// ═══════════════════════════════════════════════════════════
export const statements = {
  // ─── Audit Logs ───
  insertAuditLog: db.prepare(`
    INSERT INTO audit_logs (action, user_id, ip_address, user_agent, resource, resource_id, details, severity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),

  // ─── Firewall ───
  checkFirewallIP: db.prepare(`
    SELECT action, reason FROM firewall_rules WHERE ip = ? AND isActive = 1
  `),
  getAllFirewallRules: db.prepare(`SELECT * FROM firewall_rules ORDER BY createdAt DESC`),
  insertFirewallRule: db.prepare(`
    INSERT INTO firewall_rules (id, ip, action, reason, isActive, createdBy, createdAt)
    VALUES (?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
  `),
  deleteFirewallRule: db.prepare(`DELETE FROM firewall_rules WHERE id = ?`),

  // ─── Terms (no search) ───
  getTerms: db.prepare(`SELECT * FROM terms ORDER BY term_en LIMIT ? OFFSET ?`),
  getTermsCount: db.prepare(`SELECT COUNT(*) as count FROM terms`),

  // ─── Courses (no filter) ───
  getCourses: db.prepare(`SELECT * FROM courses WHERE 1=1 ORDER BY created_at DESC LIMIT ? OFFSET ?`),
  getCoursesCount: db.prepare(`SELECT COUNT(*) as total FROM courses WHERE 1=1`),

  // ─── Posts (no filter) ───
  getPosts: db.prepare(`SELECT * FROM posts WHERE 1=1 ORDER BY created_at DESC LIMIT ? OFFSET ?`),
  getPostsCount: db.prepare(`SELECT COUNT(*) as total FROM posts WHERE 1=1`),

  // ─── News ───
  getNews: db.prepare(`SELECT * FROM news ORDER BY created_at DESC LIMIT ? OFFSET ?`),
  getNewsCount: db.prepare(`SELECT COUNT(*) as total FROM news`),

  // ─── IDS Detection Queries ───
  idsLoginFailures: db.prepare(`
    SELECT ip_address as ip, COUNT(*) as count, MAX(created_at) as lastSeen
    FROM audit_logs
    WHERE action = 'LOGIN_FAILED' 
    AND created_at > datetime('now', '-1 hour')
    GROUP BY ip_address
    HAVING count > 5
  `),
  idsInjectionAttempts: db.prepare(`
    SELECT ip_address as ip, COUNT(*) as count, MAX(created_at) as lastSeen
    FROM audit_logs
    WHERE action = 'SUSPICIOUS_ACTIVITY'
    AND created_at > datetime('now', '-24 hours')
    GROUP BY ip_address
  `),
  idsFirewallBlocks: db.prepare(`
    SELECT ip_address as ip, COUNT(*) as count, MAX(created_at) as lastSeen
    FROM audit_logs
    WHERE action = 'FIREWALL_BLOCK'
    AND created_at > datetime('now', '-1 hour')
    GROUP BY ip_address
    HAVING count > 10
  `),

  // ─── Teacher Applications ───
  insertTeacherApplication: db.prepare(`
    INSERT INTO teacher_applications (name, email, specialization, experience, cv_link)
    VALUES (?, ?, ?, ?, ?)
  `),
  getTeacherApplications: db.prepare(`SELECT * FROM teacher_applications ORDER BY created_at DESC`),
  getTeacherApplicationById: db.prepare(`SELECT * FROM teacher_applications WHERE id = ?`),
  updateTeacherApplicationStatus: db.prepare(`UPDATE teacher_applications SET status = ?, reviewed_by = ? WHERE id = ?`),

  // ─── Live Sessions ───
  insertLiveSession: db.prepare(`
    INSERT INTO live_sessions (id, title, description, teacher_id, student_id, session_type, status, scheduled_at, room_id)
    VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
  `),
  getLiveSessionById: db.prepare(`SELECT * FROM live_sessions WHERE id = ?`),
  updateLiveSessionStatus: db.prepare(`UPDATE live_sessions SET status = ? WHERE id = ?`),
  startLiveSession: db.prepare(`UPDATE live_sessions SET status = 'active', started_at = CURRENT_TIMESTAMP WHERE id = ?`),
  endLiveSession: db.prepare(`UPDATE live_sessions SET status = 'completed', ended_at = CURRENT_TIMESTAMP WHERE id = ?`),
  deleteLiveSession: db.prepare(`DELETE FROM live_sessions WHERE id = ?`),

  // ─── Session Messages ───
  insertSessionMessage: db.prepare(`
    INSERT INTO session_messages (session_id, sender_id, sender_name, message)
    VALUES (?, ?, ?, ?)
  `),
  getSessionMessages: db.prepare(`SELECT * FROM session_messages WHERE session_id = ? ORDER BY created_at ASC`),

  // ─── Teachers ───
  getTeachers: db.prepare(`SELECT id, name, email, avatar, bio, country FROM users WHERE role = 'teacher' OR account_type = 'instructor'`),

  // ─── Course Lessons ───
  getCourseLessons: db.prepare(`SELECT * FROM course_lessons WHERE course_id = ? ORDER BY sort_order ASC`),
  getCourseLessonById: db.prepare(`SELECT * FROM course_lessons WHERE id = ?`),
  insertCourseLesson: db.prepare(`
    INSERT INTO course_lessons (course_id, title, description, video_url, video_type, duration, sort_order, is_free)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  updateCourseLesson: db.prepare(`
    UPDATE course_lessons SET title = ?, description = ?, video_url = ?, video_type = ?, duration = ?, sort_order = ?, is_free = ? WHERE id = ?
  `),
  deleteCourseLesson: db.prepare(`DELETE FROM course_lessons WHERE id = ?`),
  getCourseLessonsCount: db.prepare(`SELECT COUNT(*) as count FROM course_lessons WHERE course_id = ?`),

  // ─── Labs ───
  getLabs: db.prepare(`SELECT * FROM labs ORDER BY id DESC`),
  getLabById: db.prepare(`SELECT * FROM labs WHERE id = ?`),
  insertLabCompletion: db.prepare(`
    INSERT INTO lab_completions (lab_id, user_id, points_earned)
    VALUES (?, ?, ?)
  `),
  getLabCompletion: db.prepare(`SELECT * FROM lab_completions WHERE user_id = ? AND lab_id = ?`),

  // ─── Learning Videos ───
  getVideos: db.prepare(`SELECT * FROM learning_videos WHERE published = 1 ORDER BY sort_order ASC, id DESC LIMIT ? OFFSET ?`),
  getVideosCount: db.prepare(`SELECT COUNT(*) as total FROM learning_videos WHERE published = 1`),
  getVideoById: db.prepare(`SELECT * FROM learning_videos WHERE id = ?`),
  getVideosByCategory: db.prepare(`SELECT * FROM learning_videos WHERE category = ? AND published = 1 ORDER BY sort_order ASC LIMIT ? OFFSET ?`),
  getVideosByCategoryCount: db.prepare(`SELECT COUNT(*) as total FROM learning_videos WHERE category = ? AND published = 1`),
  getVideosByLevel: db.prepare(`SELECT * FROM learning_videos WHERE level = ? AND published = 1 ORDER BY sort_order ASC LIMIT ? OFFSET ?`),
  getVideosByLevelCount: db.prepare(`SELECT COUNT(*) as total FROM learning_videos WHERE level = ? AND published = 1`),
  getVideosByPath: db.prepare(`SELECT * FROM learning_videos WHERE path_id = ? AND published = 1 ORDER BY sort_order ASC`),
  getVideoCategories: db.prepare(`SELECT DISTINCT category FROM learning_videos WHERE published = 1 ORDER BY category`),
  incrementVideoViews: db.prepare(`UPDATE learning_videos SET views = views + 1 WHERE id = ?`),
  getPopularVideos: db.prepare(`SELECT * FROM learning_videos WHERE published = 1 ORDER BY views DESC LIMIT ?`),
  getLatestVideos: db.prepare(`SELECT * FROM learning_videos WHERE published = 1 ORDER BY created_at DESC LIMIT ?`),
  insertVideo: db.prepare(`
    INSERT INTO learning_videos (title, description, category, level, video_url, thumbnail, duration, instructor, tags, path_id, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  // ─── Video Progress ───
  getVideoProgress: db.prepare(`SELECT * FROM video_progress WHERE user_id = ? AND video_id = ?`),
  getUserVideoProgress: db.prepare(`SELECT vp.*, lv.title, lv.category, lv.level FROM video_progress vp JOIN learning_videos lv ON vp.video_id = lv.id WHERE vp.user_id = ? ORDER BY vp.last_watched_at DESC`),
  upsertVideoProgress: db.prepare(`
    INSERT INTO video_progress (user_id, video_id, watched_seconds, is_completed, last_watched_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, video_id) DO UPDATE SET
      watched_seconds = MAX(video_progress.watched_seconds, excluded.watched_seconds),
      is_completed = MAX(video_progress.is_completed, excluded.is_completed),
      last_watched_at = CURRENT_TIMESTAMP
  `),

  // ─── Video Bookmarks ───
  getVideoBookmarks: db.prepare(`SELECT vb.*, lv.title, lv.category, lv.level, lv.thumbnail, lv.duration FROM video_bookmarks vb JOIN learning_videos lv ON vb.video_id = lv.id WHERE vb.user_id = ? ORDER BY vb.created_at DESC`),
  toggleVideoBookmark: db.prepare(`INSERT INTO video_bookmarks (user_id, video_id) VALUES (?, ?) ON CONFLICT(user_id, video_id) DO NOTHING`),
  removeVideoBookmark: db.prepare(`DELETE FROM video_bookmarks WHERE user_id = ? AND video_id = ?`),
  isVideoBookmarked: db.prepare(`SELECT 1 FROM video_bookmarks WHERE user_id = ? AND video_id = ?`),

  // ─── Notifications ───
  getUserNotifications: db.prepare(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`),
  getUnreadNotificationsCount: db.prepare(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0`),
  markNotificationAsRead: db.prepare(`UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?`),
  markAllNotificationsAsRead: db.prepare(`UPDATE notifications SET read = 1 WHERE user_id = ?`),
  insertNotification: db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, icon, link)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
};

// ═══════════════════════════════════════════════════════════
// 🌱 SEED DEFAULT LAB DATA
// ═══════════════════════════════════════════════════════════
try {
    const labCount = (db.prepare('SELECT COUNT(*) as count FROM labs').get() as any)?.count || 0;
    if (labCount === 0) {
        // Lazy import to avoid circular dependency
        const { seedLabs } = require('@/lib/cyber-range/seed-labs');
        seedLabs();
    }
} catch (e) {
    // Silently skip if seeding fails (e.g., during build)
}

export default db;

// ═══════════════════════════════════════════════════════════
// 🗄️ PRISMA CLIENT (Next.js Global Caching / Lazy Init)
// ═══════════════════════════════════════════════════════════
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
