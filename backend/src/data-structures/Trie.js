/**
 * Trie (Prefix Tree) Implementation
 * 
 * WHY CHOSEN:
 * A Trie is chosen for patient name/symptom autocomplete because it allows for lightning-fast 
 * prefix-based searches. Searching for all patients whose name starts with "Jo" takes O(L) 
 * time where L is the length of the prefix, rather than scanning a whole list of patients.
 * This perfectly fulfills the DS demo requirement for instant frontend autocomplete.
 * 
 * TIME COMPLEXITIES:
 * - insert(word, data): O(L) where L is word length.
 * - search(prefix): O(L) to find prefix node, plus time to traverse subtree for all matches.
 */

class TrieNode {
  constructor() {
    this.children = {}; 
    this.isEndOfWord = false;
    this.patientData = null;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, patientData) {
    let current = this.root;
    const lowerWord = word.toLowerCase();
    
    for (let i = 0; i < lowerWord.length; i++) {
      const char = lowerWord[i];
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isEndOfWord = true;
    current.patientData = patientData;
  }

  searchByPrefix(prefix) {
    let current = this.root;
    const lowerPrefix = prefix.toLowerCase();
    
    for (let i = 0; i < lowerPrefix.length; i++) {
      const char = lowerPrefix[i];
      if (!current.children[char]) {
        return [];
      }
      current = current.children[char];
    }
    
    const results = [];
    this._collectAllWords(current, results);
    return results;
  }

  _collectAllWords(node, results) {
    if (node.isEndOfWord && node.patientData) {
      results.push(node.patientData);
    }
    
    for (const char in node.children) {
      this._collectAllWords(node.children[char], results);
    }
  }
}

module.exports = Trie;
