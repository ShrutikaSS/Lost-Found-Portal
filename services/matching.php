<?php
// TrackNFind PHP Multi-Factor Automated Matching Engine

function compute_text_similarity($str1, $str2) {
    if (empty($str1) || empty($str2)) return 0;
    $tokens1 = array_unique(explode(' ', strtolower(preg_replace('/[^\w\s]/', '', $str1))));
    $tokens2 = array_unique(explode(' ', strtolower(preg_replace('/[^\w\s]/', '', $str2))));
    
    $tokens1 = array_filter($tokens1);
    $tokens2 = array_filter($tokens2);

    if (count($tokens1) === 0 || count($tokens2) === 0) return 0;

    $intersection = count(array_intersect($tokens1, $tokens2));
    return (2 * $intersection) / (count($tokens1) + count($tokens2));
}

function compute_correlation_score($lost, $found) {
    $score = 0;

    // 1. Category match (30 points)
    if ($lost['category_id'] == $found['category_id']) {
        $score += 30;
    }

    // 2. Title & Description text similarity (30 points)
    $titleSim = compute_text_similarity($lost['title'], $found['title']);
    $descSim = compute_text_similarity($lost['description'], $found['visual_markers'] ?? '');
    $textSim = max($titleSim, ($titleSim * 0.7 + $descSim * 0.3));
    $score += $textSim * 30;

    // 3. Color & Brand match (15 points)
    if (!empty($lost['brand']) && !empty($found['brand']) && strtolower($lost['brand']) === strtolower($found['brand'])) {
        $score += 7.5;
    }
    if (!empty($lost['primary_color']) && !empty($found['primary_color']) && strtolower($lost['primary_color']) === strtolower($found['primary_color'])) {
        $score += 7.5;
    }

    // 4. Campus Zone match (15 points)
    if ($lost['campus_zone_id'] == $found['campus_zone_id']) {
        $score += 15;
    }

    // 5. Date proximity (10 points)
    $lostTime = strtotime($lost['date_lost']);
    $foundTime = strtotime($found['date_found']);
    $diffDays = abs(($foundTime - $lostTime) / 86400);

    if ($diffDays <= 2) $score += 10;
    else if ($diffDays <= 7) $score += 7;
    else if ($diffDays <= 14) $score += 4;

    return min(100, round($score, 1));
}

function run_matching_engine() {
    global $pdo;

    $lost_items = $pdo->query("SELECT * FROM lost_items WHERE status IN ('submitted', 'verified')")->fetchAll();
    $found_items = $pdo->query("SELECT * FROM found_items WHERE status IN ('submitted', 'verified', 'available')")->fetchAll();

    $new_matches = 0;

    foreach ($lost_items as $lost) {
        foreach ($found_items as $found) {
            $score = compute_correlation_score($lost, $found);

            if ($score >= 50.0) {
                $check = $pdo->prepare("SELECT id FROM matches WHERE lost_item_id = ? AND found_item_id = ?");
                $check->execute([$lost['id'], $found['id']]);

                if (!$check->fetch()) {
                    $stmt = $pdo->prepare("INSERT INTO matches (lost_item_id, found_item_id, correlation_score, status) VALUES (?, ?, ?, 'suggested')");
                    $stmt->execute([$lost['id'], $found['id'], $score]);

                    // Update lost item status to matched
                    $pdo->prepare("UPDATE lost_items SET status = 'matched' WHERE id = ? AND status IN ('submitted', 'verified')")->execute([$lost['id']]);

                    // Notify lost item reporter
                    $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Possible Match Found!', ?, 'success')")
                        ->execute([$lost['user_id'], "System found a {$score}% correlation match for lost item {$lost['title']}."]);

                    $new_matches++;
                }
            }
        }
    }

    if ($new_matches > 0) {
        require_once __DIR__ . '/audit.php';
        log_audit(null, 'SYSTEM_WORKER', 'AUTOMATED_MATCHING', 'MATCHES', null, "Generated {$new_matches} new potential item matches.");
    }

    return $new_matches;
}
