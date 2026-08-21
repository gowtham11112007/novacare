/**
 * Hash Map Implementation
 * 
 * WHY CHOSEN:
 * A Hash Map (or Hash Table) provides O(1) average time complexity for lookups. 
 * We use it to cache session data or fast mappings (like DoctorID -> list of PatientIDs) 
 * so we don't have to query the database repeatedly for static or session-scoped data.
 * 
 * TIME COMPLEXITIES:
 * - set(key, value): O(1) average
 * - get(key): O(1) average
 * - delete(key): O(1) average
 */

class HashMap {
  constructor(size = 97) {
    this.size = size;
    this.buckets = new Array(this.size);
  }

  _hash(key) {
    let hash = 0;
    const keyStr = String(key);
    for (let i = 0; i < keyStr.length; i++) {
      hash = (hash << 5) - hash + keyStr.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % this.size;
  }

  set(key, value) {
    const index = this._hash(key);
    if (!this.buckets[index]) {
      this.buckets[index] = [];
    }
    
    for (let i = 0; i < this.buckets[index].length; i++) {
      if (this.buckets[index][i][0] === key) {
        this.buckets[index][i][1] = value;
        return;
      }
    }
    
    this.buckets[index].push([key, value]);
  }

  get(key) {
    const index = this._hash(key);
    if (!this.buckets[index]) return undefined;
    
    for (let i = 0; i < this.buckets[index].length; i++) {
      if (this.buckets[index][i][0] === key) {
        return this.buckets[index][i][1];
      }
    }
    return undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    const index = this._hash(key);
    if (!this.buckets[index]) return false;
    
    for (let i = 0; i < this.buckets[index].length; i++) {
      if (this.buckets[index][i][0] === key) {
        this.buckets[index].splice(i, 1);
        return true;
      }
    }
    return false;
  }

  clear() {
    this.buckets = new Array(this.size);
  }
}

module.exports = HashMap;
