all:
	make nodeppt
	hexo g
	hexo d

nodeppt:
	$(MAKE) -C source/nodeppt/

test:
	make nodeppt
	hexo g
	hexo s
