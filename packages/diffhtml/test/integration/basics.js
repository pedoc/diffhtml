import assert from 'assert';
import * as diff from '../../lib/index';
import validateMemory from '../util/validateMemory';

describe('Integration: Basics', function() {
  beforeEach(function() {
    this.fixture = document.createElement('div');
    this.fixture.innerHTML = '<div></div>';
  });

  afterEach(function() {
    diff.release(undefined);
    diff.release(this.fixture);
    diff.removeTransitionState();

    validateMemory();
  });

  describe('Expose API', function() {
    it('exposes diffhtml global', function() {
      assert.equal(typeof diff, 'object');
    });
  });

  describe('Call API', function() {
    it('will error if element is missing', function() {
      assert.throws(function() {
        diff.innerHTML();
      });

      assert.throws(function() {
        diff.outerHTML();
      });
    });

    it('will not error if markup is missing', function() {
      var test = this;

      assert.doesNotThrow(function() {
        diff.outerHTML(test.fixture, '');
      });

      assert.doesNotThrow(function() {
        diff.innerHTML(test.fixture, '');
      });
    });

    it('will not error if options are missing', function() {
      var test = this;

      assert.doesNotThrow(function() {
        diff.outerHTML(test.fixture, '<div></div>');
      });

      assert.doesNotThrow(function() {
        diff.innerHTML(test.fixture, '<div></div>');
      });
    });
  });

  describe('Properties and Attributes Handling', () => {
    it('can "spread" inline objects into empty trees', function() {
      const vTree = diff.html`
        <div ${{ a: 1, b: false }} />
      `;

      assert.equal(vTree.attributes.a, 1);
      assert.equal(vTree.attributes.b, false);
    });

    it('can "spread" inline objects into attributes', function() {
      const vTree = diff.html`
        <div
          class="test"
          ${{ a: 1, b: false }}
          id="example"
        />
      `;

      assert.equal(vTree.attributes.class, 'test');
      assert.equal(vTree.attributes.a, 1);
      assert.equal(vTree.attributes.b, false);
      assert.equal(vTree.attributes.id, 'example');
    });

    it('can "spread" objects into attributes', function() {
      const obj = { a: 1, b: false };
      const vTree = diff.html`
        <div
          class="test"
          ${obj}
          id="example"
        />
      `;

      assert.equal(vTree.attributes.class, 'test');
      assert.equal(vTree.attributes.a, 1);
      assert.equal(vTree.attributes.b, false);
      assert.equal(vTree.attributes.id, 'example');
    });

    it('will silently ignore arrays that are attempted to be spread', function() {
      const obj = [1, false];
      const vTree = diff.html`
        <div
          class="test"
          ${obj}
          id="example"
        />
      `;

      assert.deepEqual(vTree.attributes, {
        class: 'test',
        id: 'example',
      });
    });

    it('will error if arrays are attempted to be spread in strict mode', function() {
      const obj = [1, false];

      assert.throws(() => diff.html.strict`
        <div
          class="test"
          ${obj}
          id="example"
        />
      `, /Arrays are not allowed to be spread in strict mode/);

      diff.Internals.memory.cleanMemory();
    });
  });

  describe('Special features', function() {
    it('can modify the document\'s title', function() {
      var doc = document.implementation.createHTMLDocument('');

      doc.open();
      doc.write('<html><head><title></title></head></html>');

      var documentElement = doc.documentElement;
      diff.outerHTML(documentElement, '<html><head><title>Test</title></head></html>');

      assert.equal(doc.title, 'Test');

      diff.release(documentElement);
      doc.close();
    });
  });

  describe('DocumentFragment', function() {
    it('can diff elements into a fragment', function() {
      var fragment = document.createDocumentFragment();

      diff.innerHTML(fragment, `
        <p>Supports DocumentFragments</p>
      `);

      assert.equal(fragment.childNodes[0].nodeName.toLowerCase(), 'p');
      assert.equal(fragment.childNodes[0].childNodes[0].nodeValue, 'Supports DocumentFragments');

      diff.release(fragment);
    });

    // Temporarily removed this function, saving this test until a suitable
    // replacement is created. This test will be migrated then.
    it('can diff a fragment into an element', function() {
      var fragment = document.createDocumentFragment();

      diff.innerHTML(fragment, `
        <h1>It works</h1>
      `);

      diff.innerHTML(this.fixture, fragment);

      assert.equal(this.fixture.childNodes[0].nodeName.toLowerCase(), 'h1');
      assert.equal(this.fixture.childNodes[0].childNodes[0].nodeValue, 'It works');

      diff.release(fragment);
    });
  });

  describe('Custom elements', function() {
    it('supports the use of custom elements', function() {
      diff.innerHTML(this.fixture, '<custom-element></custom-element>');

      assert.ok(this.fixture.querySelector('custom-element'));
    });
  });
});
