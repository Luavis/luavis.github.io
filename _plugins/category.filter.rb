
module Jekyll
  
  module CategoryFilter

    def category_link(category_name)
      Jekyll.sites()[0].baseurl + "category/" + category_name
    end

  end
end

Liquid::Template.register_filter(Jekyll::CategoryFilter)
