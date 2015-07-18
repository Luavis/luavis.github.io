module Jekyll
  module AddFilter

    def add(num, add)
      num.to_i + add.to_i
    end

  end
end

Liquid::Template.register_filter(Jekyll::AddFilter)
