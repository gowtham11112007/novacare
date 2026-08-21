/**
 * MinHeap Implementation
 * 
 * WHY CHOSEN:
 * A Min-Heap provides an optimal way to repeatedly find and extract the minimum element.
 * For Doctor Load Balancing, we always need the doctor with the lowest `current_load`.
 * For the Patient Priority Queue, we need the patient with the highest `risk_score`. 
 * (We can use a Min-Heap with negative risk scores, or simply provide a custom comparator 
 * to turn it into a Max-Heap). An array-based binary heap is chosen over a balanced BST 
 * because it has lower memory overhead and faster O(1) constant factors for finding the root.
 * 
 * TIME COMPLEXITIES:
 * - insert(val): O(log N) - Add at end and bubble up.
 * - extractMin(): O(log N) - Swap root with last, remove last, bubble down.
 * - peek(): O(1) - Return root.
 * - removeByCondition(condition): O(N) - Linear search to find, then O(log N) to fix heap property.
 */

class MinHeap {
  constructor(comparator = (a, b) => a - b) {
    this.heap = [];
    this.compare = comparator; // returns < 0 if a < b
  }

  getLeftChildIndex(parentIndex) { return 2 * parentIndex + 1; }
  getRightChildIndex(parentIndex) { return 2 * parentIndex + 2; }
  getParentIndex(childIndex) { return Math.floor((childIndex - 1) / 2); }

  hasLeftChild(index) { return this.getLeftChildIndex(index) < this.heap.length; }
  hasRightChild(index) { return this.getRightChildIndex(index) < this.heap.length; }
  hasParent(index) { return this.getParentIndex(index) >= 0; }

  leftChild(index) { return this.heap[this.getLeftChildIndex(index)]; }
  rightChild(index) { return this.heap[this.getRightChildIndex(index)]; }
  parent(index) { return this.heap[this.getParentIndex(index)]; }

  swap(indexOne, indexTwo) {
    const temp = this.heap[indexOne];
    this.heap[indexOne] = this.heap[indexTwo];
    this.heap[indexTwo] = temp;
  }

  peek() {
    if (this.heap.length === 0) return null;
    return this.heap[0];
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    
    const item = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown();
    return item;
  }

  insert(item) {
    this.heap.push(item);
    this.heapifyUp();
  }

  removeByCondition(conditionFn) {
    const index = this.heap.findIndex(conditionFn);
    if (index === -1) return false;
    
    this.swap(index, this.heap.length - 1);
    const removedItem = this.heap.pop();
    
    if (index < this.heap.length) {
      this.heapifyUp(index);
      this.heapifyDown(index);
    }
    return true;
  }

  heapifyUp(index = this.heap.length - 1) {
    let currentIndex = index;
    while (this.hasParent(currentIndex) && this.compare(this.heap[currentIndex], this.parent(currentIndex)) < 0) {
      this.swap(this.getParentIndex(currentIndex), currentIndex);
      currentIndex = this.getParentIndex(currentIndex);
    }
  }

  heapifyDown(index = 0) {
    let currentIndex = index;
    while (this.hasLeftChild(currentIndex)) {
      let smallerChildIndex = this.getLeftChildIndex(currentIndex);
      if (this.hasRightChild(currentIndex) && this.compare(this.rightChild(currentIndex), this.leftChild(currentIndex)) < 0) {
        smallerChildIndex = this.getRightChildIndex(currentIndex);
      }

      if (this.compare(this.heap[currentIndex], this.heap[smallerChildIndex]) < 0) {
        break;
      } else {
        this.swap(currentIndex, smallerChildIndex);
      }
      currentIndex = smallerChildIndex;
    }
  }

  size() {
    return this.heap.length;
  }
}

module.exports = MinHeap;
