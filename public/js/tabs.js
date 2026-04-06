document.querySelectorAll('.tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    var target = this.dataset.target;

    document.querySelectorAll('.tab').forEach(function(t) {
      t.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(function(c) {
      c.classList.remove('active');
    });

    this.classList.add('active');
    var content = document.getElementById(target);
    if (content) content.classList.add('active');
  });
});
